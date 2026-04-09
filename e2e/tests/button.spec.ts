import { test, expect } from '../fixtures/base'
import { BasePage } from '../pages/BasePage'
import { PAGES } from '../fixtures/test-constants'

test.describe('Button', () => {
  test.beforeEach(async ({ page, goToPage }) => {
    const basePage = new BasePage(page)
    await goToPage(PAGES.xxl.slug)
    await basePage.dismissCookieBanner()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
  })

  test('primary and secondary buttons render', async ({ page }) => {
    await expect(page.getByText('Primary Button')).toBeVisible()
    await expect(page.getByText('Secondary Button')).toBeVisible()
  })

  test('buttons are wrapped in links', async ({ page }) => {
    // Button component renders as a NuxtLink (<a>)
    const primary = page.locator('a').filter({ hasText: 'Primary Button' })
    await expect(primary).toBeVisible()
  })
})
