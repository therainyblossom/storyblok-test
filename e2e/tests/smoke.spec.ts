import { test, expect, checkA11y } from '../fixtures/base'
import { BasePage } from '../pages/BasePage'
import { PAGES } from '../fixtures/test-constants'

test.describe('Smoke & Accessibility', () => {
  test('homepage loads and passes accessibility checks', async ({ page, goToPage, checkA11y }) => {
    const basePage = new BasePage(page)

    await goToPage(PAGES.home.slug)
    await basePage.dismissCookieBanner()

    // Wait for Storyblok content to render (SPA with ssr: false)
    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 15000 })

    // Verify core page structure
    await expect(basePage.header).toBeVisible()
    await expect(basePage.footer).toBeVisible()
    await expect(basePage.mainContent).toBeVisible()

    // Run WCAG 2.1 AA accessibility scan
    const result = await checkA11y({ filterContrast: true })

    const critical = result.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    if (critical.length > 0) {
      const summary = critical
        .map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} element(s)`)
        .join('\n')
      test.fail(true, `Critical/serious a11y violations:\n${summary}`)
    }
  })

  test('homepage loads on mobile viewport', async ({ page, goToPage, checkA11y }) => {
    const basePage = new BasePage(page)

    await page.setViewportSize({ width: 375, height: 812 })
    await goToPage(PAGES.home.slug)
    await basePage.dismissCookieBanner()

    await page.waitForLoadState('networkidle')
    await page.locator('main').waitFor({ state: 'visible', timeout: 15000 })

    await expect(basePage.header).toBeVisible()
    await expect(basePage.mainContent).toBeVisible()

    await checkA11y({ filterContrast: true })
  })
})
