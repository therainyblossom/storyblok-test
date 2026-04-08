import type { Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ManualA11yFinding {
  category: 'keyboard' | 'focus' | 'heading' | 'aria' | 'semantic'
  rule: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  status: 'pass' | 'fail'
  description: string
  selector?: string
  details?: string
}

interface CollectOption {
  /** If true, return findings instead of throwing on failure */
  collect?: boolean
}

// ---------------------------------------------------------------------------
// Modal focus trap
// ---------------------------------------------------------------------------

/**
 * Verify a modal traps focus: Tab cycles inside, Escape closes, focus returns to trigger.
 *
 * Expects the modal to have role="dialog" or aria-modal="true".
 */
export async function testModalFocusTrap(
  page: Page,
  modalSelector: string,
  triggerSelector?: string,
  options?: CollectOption,
): Promise<ManualA11yFinding[]> {
  const findings: ManualA11yFinding[] = []
  const modal = page.locator(modalSelector)

  function pass(rule: string, description: string) {
    findings.push({ category: 'focus', rule, impact: 'critical', status: 'pass', description, selector: modalSelector })
  }

  function fail(rule: string, description: string, details?: string) {
    findings.push({ category: 'focus', rule, impact: 'critical', status: 'fail', description, selector: modalSelector, details })
  }

  try {
    // Check visibility
    const visible = await modal.isVisible({ timeout: 3000 }).catch(() => false)
    if (!visible) {
      fail('focus-trap-visible', 'Modal should be visible', `${modalSelector} not found or hidden`)
      if (!options?.collect) throw new Error(`Modal ${modalSelector} is not visible`)
      return findings
    }
    pass('focus-trap-visible', 'Modal is visible')

    // Check dialog semantics
    const role = await modal.getAttribute('role')
    const ariaModal = await modal.getAttribute('aria-modal')
    if (role === 'dialog' || ariaModal === 'true') {
      pass('focus-trap-role', 'Modal has dialog role or aria-modal')
    } else {
      fail('focus-trap-role', 'Modal should have role="dialog" or aria-modal="true"', `Found role="${role}", aria-modal="${ariaModal}"`)
    }

    // Check focusable elements exist
    const focusable = modal.locator(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    const count = await focusable.count()
    if (count > 0) {
      pass('focus-trap-focusable', `Modal has ${count} focusable elements`)
    } else {
      fail('focus-trap-focusable', 'Modal should contain at least one focusable element')
      if (!options?.collect) throw new Error('Modal has no focusable elements')
      return findings
    }

    // Tab should cycle inside the modal
    await focusable.first().focus()
    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Tab')
    }
    const focusInsideAfterCycle = await modal.locator(':focus').count()
    if (focusInsideAfterCycle > 0) {
      pass('focus-trap-cycle', 'Tab cycles within modal')
    } else {
      fail('focus-trap-cycle', 'Focus should stay trapped inside modal after Tab cycle')
    }

    // Escape should close
    await page.keyboard.press('Escape')
    const hiddenAfterEsc = await modal.isHidden().catch(() => false)
    if (hiddenAfterEsc) {
      pass('focus-trap-escape', 'Escape closes the modal')
    } else {
      fail('focus-trap-escape', 'Escape should close the modal')
    }

    // Focus should return to trigger
    if (triggerSelector && hiddenAfterEsc) {
      const trigger = page.locator(triggerSelector)
      const triggerFocused = await trigger.evaluate(
        (el: Element) => el === document.activeElement,
      ).catch(() => false)
      if (triggerFocused) {
        pass('focus-trap-return', 'Focus returned to trigger after close')
      } else {
        fail('focus-trap-return', 'Focus should return to trigger element after modal closes', `Expected focus on ${triggerSelector}`)
      }
    }
  } catch (e) {
    if (!options?.collect) throw e
  }

  if (!options?.collect) {
    const failures = findings.filter((f) => f.status === 'fail')
    if (failures.length > 0) {
      throw new Error(
        `Focus trap failures:\n${failures.map((f) => `  ${f.rule}: ${f.details || f.description}`).join('\n')}`,
      )
    }
  }

  return findings
}

// ---------------------------------------------------------------------------
// Tab navigation
// ---------------------------------------------------------------------------

/**
 * Verify tab widget keyboard navigation: arrow keys move between tabs,
 * Tab key leaves the tablist into the panel content.
 */
export async function testTabNavigation(
  page: Page,
  containerSelector: string,
  options?: CollectOption,
): Promise<ManualA11yFinding[]> {
  const findings: ManualA11yFinding[] = []
  const container = page.locator(containerSelector)
  const tablist = container.locator('[role="tablist"]')
  const tabs = tablist.locator('[role="tab"]')

  function pass(rule: string, description: string) {
    findings.push({ category: 'keyboard', rule, impact: 'serious', status: 'pass', description, selector: containerSelector })
  }

  function fail(rule: string, description: string, details?: string) {
    findings.push({ category: 'keyboard', rule, impact: 'serious', status: 'fail', description, selector: containerSelector, details })
  }

  try {
    const count = await tabs.count()
    if (count < 2) {
      fail('tab-nav-count', 'Tablist should have at least 2 tabs', `Found ${count}`)
      if (!options?.collect) throw new Error(`Tablist needs >= 2 tabs, found ${count}`)
      return findings
    }
    pass('tab-nav-count', `Tablist has ${count} tabs`)

    // Focus first tab
    await tabs.first().focus()
    const firstFocused = await tabs.first().evaluate((el: Element) => el === document.activeElement)
    if (firstFocused) {
      pass('tab-nav-focus', 'First tab is focusable')
    } else {
      fail('tab-nav-focus', 'First tab should be focusable')
    }

    // ArrowRight moves to next
    await page.keyboard.press('ArrowRight')
    const secondFocused = await tabs.nth(1).evaluate((el: Element) => el === document.activeElement)
    if (secondFocused) {
      pass('tab-nav-arrow-right', 'ArrowRight moves to next tab')
    } else {
      fail('tab-nav-arrow-right', 'ArrowRight should move focus to the next tab')
    }

    // Check panel visibility
    const secondTabId = await tabs.nth(1).getAttribute('aria-controls')
    if (secondTabId) {
      const panelVisible = await page.locator(`#${secondTabId}`).isVisible().catch(() => false)
      if (panelVisible) {
        pass('tab-nav-panel', 'Associated panel is visible after tab switch')
      } else {
        fail('tab-nav-panel', 'Panel should be visible when its tab is active', `#${secondTabId} not visible`)
      }
    }

    // ArrowLeft moves back
    await page.keyboard.press('ArrowLeft')
    const backToFirst = await tabs.first().evaluate((el: Element) => el === document.activeElement)
    if (backToFirst) {
      pass('tab-nav-arrow-left', 'ArrowLeft moves back to previous tab')
    } else {
      fail('tab-nav-arrow-left', 'ArrowLeft should move focus to the previous tab')
    }

    // Tab key exits the tablist
    await page.keyboard.press('Tab')
    const stillInTablist = await tablist.locator(':focus').count()
    if (stillInTablist === 0) {
      pass('tab-nav-exit', 'Tab key moves focus out of the tablist')
    } else {
      fail('tab-nav-exit', 'Tab key should move focus out of the tablist into panel content')
    }
  } catch (e) {
    if (!options?.collect) throw e
  }

  if (!options?.collect) {
    const failures = findings.filter((f) => f.status === 'fail')
    if (failures.length > 0) {
      throw new Error(
        `Tab navigation failures:\n${failures.map((f) => `  ${f.rule}: ${f.details || f.description}`).join('\n')}`,
      )
    }
  }

  return findings
}

// ---------------------------------------------------------------------------
// Dropdown keyboard
// ---------------------------------------------------------------------------

/**
 * Verify dropdown keyboard navigation: Enter/Space opens, arrow keys navigate,
 * Escape closes and returns focus to trigger.
 */
export async function testDropdownKeyboard(
  page: Page,
  triggerSelector: string,
  options?: CollectOption,
): Promise<ManualA11yFinding[]> {
  const findings: ManualA11yFinding[] = []

  function pass(rule: string, description: string) {
    findings.push({ category: 'keyboard', rule, impact: 'serious', status: 'pass', description, selector: triggerSelector })
  }

  function fail(rule: string, description: string, details?: string) {
    findings.push({ category: 'keyboard', rule, impact: 'serious', status: 'fail', description, selector: triggerSelector, details })
  }

  try {
    const trigger = page.locator(triggerSelector)
    await trigger.focus()

    // Open with Enter
    await page.keyboard.press('Enter')
    const dropdown = page.locator('[role="listbox"], [role="menu"]')
    const dropdownVisible = await dropdown.isVisible({ timeout: 2000 }).catch(() => false)
    if (dropdownVisible) {
      pass('dropdown-open', 'Enter opens the dropdown')
    } else {
      fail('dropdown-open', 'Enter should open the dropdown')
      if (!options?.collect) throw new Error('Dropdown did not open on Enter')
      return findings
    }

    const menuOptions = dropdown.locator('[role="option"], [role="menuitem"]')
    const optCount = await menuOptions.count()
    if (optCount > 0) {
      pass('dropdown-options', `Dropdown has ${optCount} options`)
    } else {
      fail('dropdown-options', 'Dropdown should have at least one option/menuitem')
    }

    // ArrowDown navigates
    await page.keyboard.press('ArrowDown')
    const focusInDropdown = await dropdown.locator(':focus').count()
    if (focusInDropdown > 0) {
      pass('dropdown-arrow', 'ArrowDown moves focus into options')
    } else {
      fail('dropdown-arrow', 'ArrowDown should move focus to a dropdown option')
    }

    // Escape closes and returns focus
    await page.keyboard.press('Escape')
    const dropdownHidden = await dropdown.isHidden().catch(() => false)
    if (dropdownHidden) {
      pass('dropdown-escape', 'Escape closes the dropdown')
    } else {
      fail('dropdown-escape', 'Escape should close the dropdown')
    }

    const triggerFocused = await trigger.evaluate(
      (el: Element) => el === document.activeElement,
    ).catch(() => false)
    if (triggerFocused) {
      pass('dropdown-focus-return', 'Focus returned to trigger after Escape')
    } else {
      fail('dropdown-focus-return', 'Focus should return to trigger after closing dropdown')
    }
  } catch (e) {
    if (!options?.collect) throw e
  }

  if (!options?.collect) {
    const failures = findings.filter((f) => f.status === 'fail')
    if (failures.length > 0) {
      throw new Error(
        `Dropdown keyboard failures:\n${failures.map((f) => `  ${f.rule}: ${f.details || f.description}`).join('\n')}`,
      )
    }
  }

  return findings
}

// ---------------------------------------------------------------------------
// Heading hierarchy
// ---------------------------------------------------------------------------

/**
 * Assert valid heading hierarchy: exactly one h1, no skipped levels.
 */
export async function assertHeadingHierarchy(
  page: Page,
  options?: CollectOption,
): Promise<ManualA11yFinding[]> {
  const findings: ManualA11yFinding[] = []

  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
  const levels: number[] = []

  for (const heading of headings) {
    const tag = await heading.evaluate((el: Element) => el.tagName.toLowerCase())
    levels.push(parseInt(tag.replace('h', ''), 10))
  }

  // Check for exactly one h1
  const h1Count = levels.filter((l) => l === 1).length
  if (h1Count === 1) {
    findings.push({
      category: 'heading',
      rule: 'heading-h1-count',
      impact: 'serious',
      status: 'pass',
      description: 'Exactly one h1 found',
    })
  } else if (h1Count === 0) {
    findings.push({
      category: 'heading',
      rule: 'heading-h1-count',
      impact: 'serious',
      status: 'fail',
      description: 'Page should have exactly one h1',
      details: 'No h1 found on the page',
    })
  } else {
    findings.push({
      category: 'heading',
      rule: 'heading-h1-count',
      impact: 'serious',
      status: 'fail',
      description: 'Page should have exactly one h1',
      details: `Found ${h1Count} h1 elements`,
    })
  }

  // Check for skipped levels
  let skips = 0
  for (let i = 1; i < levels.length; i++) {
    const prev = levels[i - 1]
    const curr = levels[i]
    if (curr > prev && curr - prev > 1) {
      skips++
      findings.push({
        category: 'heading',
        rule: 'heading-skip',
        impact: 'moderate',
        status: 'fail',
        description: `Skipped heading level: h${prev} → h${curr}`,
        details: `Heading ${i + 1} skips from h${prev} to h${curr}`,
      })
    }
  }

  if (skips === 0) {
    findings.push({
      category: 'heading',
      rule: 'heading-skip',
      impact: 'moderate',
      status: 'pass',
      description: 'No heading levels skipped',
    })
  }

  if (!options?.collect) {
    const failures = findings.filter((f) => f.status === 'fail')
    if (failures.length > 0) {
      throw new Error(
        `Heading hierarchy violations:\n  ${failures.map((f) => f.details || f.description).join('\n  ')}`,
      )
    }
  }

  return findings
}
