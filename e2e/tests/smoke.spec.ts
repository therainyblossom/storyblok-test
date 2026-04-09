import { test, expect } from '../fixtures/base'
import { BasePage } from '../pages/BasePage'
import { PAGES } from '../fixtures/test-constants'

/**
 * Smoke test — runs against the XXL page which contains every component.
 * Other pages have varying content; XXL is the stable reference.
 */
test.describe('Smoke', () => {
  test.beforeEach(async ({ page, goToPage }) => {
    const basePage = new BasePage(page)
    await goToPage(PAGES.xxl.slug)
    await basePage.dismissCookieBanner()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
  })

  test('XXL page loads with content', async ({ page }) => {
    // At least one h1
    const h1s = page.getByRole('heading', { level: 1 })
    await expect(h1s.first()).toBeVisible()

    // Nav and footer
    await expect(page.locator('#default-header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('XXL page passes accessibility checks', async ({ page, checkA11y }) => {
    await checkA11y({ filterContrast: true })
  })

  test('XXL page accessible on mobile', async ({ page, checkA11y }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
    await checkA11y({ filterContrast: true })
  })
})
