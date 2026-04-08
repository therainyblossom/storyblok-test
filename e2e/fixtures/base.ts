import { test as base, expect } from '@playwright/test'
import { checkAccessibility } from '../helpers/accessibility'
import type { A11yOptions, A11yResult } from '../helpers/accessibility'
import type { ManualA11yFinding } from '../helpers/accessibility-patterns'
import { dismissCookieConsent } from '../helpers/cookie-consent'

/**
 * Extended test fixtures.
 *
 * Every test automatically gets:
 * - goToPage — locale-aware navigation
 * - checkA11y — axe-core WCAG 2.1 AA scan (attaches results for the reporter)
 * - reportA11y — collect manual keyboard/ARIA/heading findings for the reporter
 */
export const test = base.extend<{
  /** Navigate to a Storyblok-driven page, optionally with a locale prefix */
  goToPage: (slug: string, locale?: string) => Promise<void>
  /** Run an axe-core accessibility check on the current page */
  checkA11y: (options?: A11yOptions) => Promise<A11yResult>
  /**
   * Report manual a11y findings (keyboard, focus, heading, ARIA checks).
   * Call with the result of any accessibility-patterns helper using { collect: true }.
   *
   * Usage:
   *   const findings = await assertHeadingHierarchy(page, { collect: true })
   *   reportA11y(findings)
   */
  reportA11y: (findings: ManualA11yFinding[]) => void
}>({
  goToPage: async ({ page }, use) => {
    await use(async (slug: string, locale?: string) => {
      const path = locale ? `/${locale}/${slug}` : `/${slug}`
      await page.goto(path, { waitUntil: 'networkidle' })
    })
  },

  checkA11y: async ({ page }, use, testInfo) => {
    await use(async (options?: A11yOptions) => {
      const result = await checkAccessibility(page, options)
      await testInfo.attach('_a11y-result', {
        body: JSON.stringify({ url: page.url(), violations: result.violations }),
        contentType: 'application/json',
      })
      return result
    })
  },

  reportA11y: async ({ page }, use, testInfo) => {
    const collected: ManualA11yFinding[] = []

    await use((findings: ManualA11yFinding[]) => {
      collected.push(...findings)
    })

    // After the test finishes, attach all collected manual findings
    if (collected.length > 0) {
      await testInfo.attach('_manual-a11y-result', {
        body: JSON.stringify({ url: page.url(), findings: collected }),
        contentType: 'application/json',
      })
    }
  },
})

/** Dismiss a cookie consent banner if visible */
export { dismissCookieConsent as dismissCookieBanner }
export { dismissCookieConsent }

export { expect }
export type { A11yOptions, A11yResult }
export type { ManualA11yFinding }
