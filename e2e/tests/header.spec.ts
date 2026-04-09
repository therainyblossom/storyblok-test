import { test, expect } from '../fixtures/base'
import { BasePage } from '../pages/BasePage'
import { PAGES } from '../fixtures/test-constants'

test.describe('Header', () => {
  test.beforeEach(async ({ page, goToPage }) => {
    const basePage = new BasePage(page)
    await goToPage(PAGES.xxl.slug)
    await basePage.dismissCookieBanner()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
  })

  test('nav is visible on page load', async ({ page }) => {
    await expect(page.locator('#default-header')).toBeVisible()
  })

  test('nav is sticky', async ({ page }) => {
    const nav = page.locator('#default-header')

    // Verify sticky classes
    await expect(nav).toHaveClass(/sticky/)
    await expect(nav).toHaveClass(/top-0/)

    // Scroll to bottom of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(300)

    // Nav should still be visible after scrolling
    await expect(nav).toBeVisible()
    await expect(nav).toBeInViewport()
  })

  test('nav remains accessible after scroll', async ({ page, checkA11y }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(300)
    await checkA11y({ filterContrast: true })
  })
})
