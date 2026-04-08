import { test, expect } from '../fixtures/base'
import { BasePage } from '../pages/BasePage'
import { PAGES } from '../fixtures/test-constants'

test.describe('Smoke & Accessibility', () => {
  test('homepage loads and passes accessibility checks', async ({ page, goToPage, checkA11y }) => {
    const basePage = new BasePage(page)

    await goToPage(PAGES.home.slug)
    await basePage.dismissCookieBanner()

    // Wait for SPA to mount (ssr: false — Vue hydrates client-side)
    await page.waitForLoadState('networkidle')

    // The app shell always renders header/main/footer from the layout.
    // Content inside <main> depends on Storyblok stories existing.
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })

    // Run WCAG 2.1 AA accessibility scan on whatever rendered
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
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })

    await checkA11y({ filterContrast: true })
  })
})
