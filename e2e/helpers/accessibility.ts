import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

export interface A11yResult {
  violations: Array<{
    id: string
    impact: string
    description: string
    helpUrl: string
    nodes: Array<{ html: string; target: string[] }>
  }>
  passes: number
}

export interface A11yOptions {
  /** WCAG tags to check against. Defaults to WCAG 2.1 AA */
  tags?: string[]
  /** CSS selectors to exclude from checks */
  exclude?: string[]
  /** If true, only log warnings — never fail the test */
  warnOnly?: boolean
  /** If true, wait for DOM stability and open <details> elements before scanning */
  prepare?: boolean
  /** If true (requires prepare), also click accordions/tabs/comboboxes/modals to expose hidden content. Can cause side effects. */
  prepareAggressive?: boolean
  /** If true, cross-validate color-contrast violations with getComputedStyle to remove false positives */
  filterContrast?: boolean
}

const DEFAULT_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa']

/**
 * Wait for the DOM to stop mutating. Uses a MutationObserver that resolves
 * after `idleMs` of silence, with a hard `timeout` cap.
 */
export async function waitForDomStable(page: Page, timeout = 5000, idleMs = 500): Promise<void> {
  await page.evaluate(({ timeout, idleMs }) => {
    return new Promise<void>((resolve) => {
      let timer: ReturnType<typeof setTimeout>
      const observer = new MutationObserver(() => {
        clearTimeout(timer)
        timer = setTimeout(() => { observer.disconnect(); resolve() }, idleMs)
      })
      observer.observe(document.body, { childList: true, subtree: true, attributes: true })
      timer = setTimeout(() => { observer.disconnect(); resolve() }, idleMs)
      setTimeout(() => { observer.disconnect(); resolve() }, timeout)
    })
  }, { timeout, idleMs })
}

/**
 * Expand hidden content so axe can scan it.
 *
 * By default only opens `<details>` elements (safe, no side effects).
 * Pass `{ aggressive: true }` to also click collapsed accordions, tabs,
 * comboboxes, and modal triggers — this can cause navigation, state changes,
 * or unexpected side effects. Use aggressive mode only when you need to scan
 * content inside interactive widgets and are prepared for the page state to change.
 */
export async function exposeHiddenContent(
  page: Page,
  options?: { aggressive?: boolean },
): Promise<void> {
  const safeEval = (fn: () => void) => page.evaluate(fn).catch(() => {})

  // Safe: open all <details> elements (no click, no side effects)
  await safeEval(() => {
    document.querySelectorAll('details:not([open])').forEach(el => el.setAttribute('open', ''))
  })

  if (!options?.aggressive) return

  // Aggressive: click interactive elements to reveal hidden content.
  // WARNING: these can trigger navigation, change state, or cause errors.

  // Click collapsed accordions (skip links that would navigate away)
  await safeEval(() => {
    document.querySelectorAll('[aria-expanded="false"]').forEach(el => {
      if ((el as HTMLElement).tagName === 'A' || el.closest('a')) return
      ;(el as HTMLElement).click()
    })
  })

  // Click inactive tabs (skip link-based tabs)
  await safeEval(() => {
    document.querySelectorAll('[role="tab"]:not([aria-selected="true"])').forEach(el => {
      if ((el as HTMLElement).tagName === 'A' || el.closest('a')) return
      ;(el as HTMLElement).click()
    })
  })

  // Open closed comboboxes to render their listboxes
  await safeEval(() => {
    document.querySelectorAll('[role="combobox"][aria-expanded="false"]').forEach(el =>
      (el as HTMLElement).click(),
    )
  })

  // Trigger Bootstrap modal openers
  await safeEval(() => {
    document.querySelectorAll('[data-toggle="modal"], [data-bs-toggle="modal"]').forEach(el =>
      (el as HTMLElement).click(),
    )
  })

  await page.waitForTimeout(500)
}

/**
 * Cross-validate color-contrast violations using the browser's getComputedStyle.
 * Removes false positives caused by axe misresolving modern CSS (e.g., relative color syntax).
 * Mutates the violations array in place — removes nodes that actually pass and drops
 * violations with no remaining nodes.
 */
export async function filterFalseContrastViolations(
  page: Page,
  violations: Array<{ id: string; nodes: Array<{ target?: unknown[] }> }>,
): Promise<void> {
  const contrastViolations = violations.filter(v => v.id === 'color-contrast')
  if (contrastViolations.length === 0) return

  const allNodes: { selector: string; violationIndex: number; nodeIndex: number }[] = []
  for (const v of contrastViolations) {
    const vi = violations.indexOf(v)
    for (let ni = 0; ni < v.nodes.length; ni++) {
      const target = v.nodes[ni].target
      if (target?.length) {
        allNodes.push({ selector: target[0] as string, violationIndex: vi, nodeIndex: ni })
      }
    }
  }
  if (allNodes.length === 0) return

  const selectors = allNodes.map(n => n.selector)
  const passResults = await page.evaluate((sels: string[]) => {
    function parseColor(str: string): [number, number, number, number] | null {
      const ctx = document.createElement('canvas').getContext('2d')
      if (!ctx) return null
      ctx.fillStyle = '#000001'
      ctx.fillStyle = str
      if (ctx.fillStyle === '#000001') return null
      const hex = ctx.fillStyle
      if (hex.startsWith('#')) {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        const a = hex.length > 7 ? parseInt(hex.slice(7, 9), 16) / 255 : 1
        return [r, g, b, a]
      }
      return null
    }

    function luminance(r: number, g: number, b: number): number {
      const [rs, gs, bs] = [r, g, b].map(c => {
        const s = c / 255
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    return sels.map(sel => {
      try {
        const el = document.querySelector(sel)
        if (!el) return null
        const style = getComputedStyle(el)

        const fg = parseColor(style.color)
        if (!fg) return null

        let bgColor: [number, number, number, number] = [255, 255, 255, 1]
        let current: Element | null = el as Element
        while (current) {
          const bg = getComputedStyle(current).backgroundColor
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            const parsed = parseColor(bg)
            if (parsed) { bgColor = parsed; break }
          }
          current = current.parentElement
        }

        // Alpha composite foreground onto background
        const r = fg[0] * fg[3] + bgColor[0] * (1 - fg[3])
        const g = fg[1] * fg[3] + bgColor[1] * (1 - fg[3])
        const b = fg[2] * fg[3] + bgColor[2] * (1 - fg[3])

        const fgLum = luminance(r, g, b)
        const bgLum = luminance(bgColor[0], bgColor[1], bgColor[2])
        const ratio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05)

        const fontSizePx = parseFloat(style.fontSize)
        const fontWeight = parseInt(style.fontWeight, 10) || 400
        const isLarge = fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700)

        return ratio >= (isLarge ? 3 : 4.5)
      } catch { return null }
    })
  }, selectors)

  // Track pass/fail/null per violation
  const violationStats = new Map<number, { passed: number; failed: number }>()
  for (let i = 0; i < allNodes.length; i++) {
    const vi = allNodes[i].violationIndex
    if (!violationStats.has(vi)) violationStats.set(vi, { passed: 0, failed: 0 })
    const stats = violationStats.get(vi)!
    if (passResults[i] === true) stats.passed++
    else if (passResults[i] === false) stats.failed++
  }

  const nodesToRemove = new Set<string>()
  for (let i = 0; i < allNodes.length; i++) {
    const vi = allNodes[i].violationIndex
    const stats = violationStats.get(vi)!
    if (passResults[i] === true) {
      nodesToRemove.add(`${vi}::${allNodes[i].nodeIndex}`)
    } else if (passResults[i] === null && stats.failed === 0 && stats.passed > 0) {
      // All verifiable nodes passed — unverifiable ones are likely the same false positive
      nodesToRemove.add(`${vi}::${allNodes[i].nodeIndex}`)
    }
  }

  for (const v of contrastViolations) {
    const vi = violations.indexOf(v)
    for (let ni = v.nodes.length - 1; ni >= 0; ni--) {
      if (nodesToRemove.has(`${vi}::${ni}`)) {
        v.nodes.splice(ni, 1)
      }
    }
  }

  // Remove violations with no remaining nodes
  const contrastIds = new Set(contrastViolations.map(v => violations.indexOf(v)))
  for (let i = violations.length - 1; i >= 0; i--) {
    if (contrastIds.has(i) && violations[i].nodes.length === 0) {
      violations.splice(i, 1)
    }
  }
}

export async function checkAccessibility(
  page: Page,
  options: A11yOptions = {},
): Promise<A11yResult> {
  const tags = options.tags || DEFAULT_TAGS

  // Optional pre-scan preparation
  if (options.prepare) {
    await waitForDomStable(page)
    await exposeHiddenContent(page, { aggressive: options.prepareAggressive })
  }

  let builder = new AxeBuilder({ page }).withTags(tags)

  if (options.exclude) {
    for (const selector of options.exclude) {
      builder = builder.exclude(selector)
    }
  }

  const results = await builder.analyze()

  // Optional contrast false-positive filtering
  if (options.filterContrast) {
    await filterFalseContrastViolations(page, results.violations as any)
  }

  const critical = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  )

  const warnings = results.violations.filter(
    (v) => v.impact === 'moderate' || v.impact === 'minor',
  )

  if (warnings.length > 0) {
    console.warn(
      `⚠️  ${warnings.length} a11y warnings:`,
      warnings.map((w) => `${w.id} (${w.impact})`).join(', '),
    )
  }

  if (!options.warnOnly && critical.length > 0) {
    const summary = critical
      .map(
        (v) =>
          `\n  ❌ ${v.id} (${v.impact}): ${v.description}\n     ${v.helpUrl}\n     Affected: ${v.nodes.map((n) => n.html.slice(0, 80)).join(', ')}`,
      )
      .join('')

    throw new Error(
      `${critical.length} critical accessibility violation(s):${summary}`,
    )
  }

  return {
    violations: results.violations.map((v) => ({
      id: v.id,
      impact: v.impact || 'unknown',
      description: v.description,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n) => ({
        html: n.html,
        target: n.target as string[],
      })),
    })),
    passes: results.passes.length,
  }
}
