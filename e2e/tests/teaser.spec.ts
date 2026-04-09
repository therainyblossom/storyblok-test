import { test, expect } from '../fixtures/base'
import { BasePage } from '../pages/BasePage'
import { PAGES } from '../fixtures/test-constants'

test.describe('Teaser', () => {
  test.beforeEach(async ({ page, goToPage }) => {
    const basePage = new BasePage(page)
    await goToPage(PAGES.xxl.slug)
    await basePage.dismissCookieBanner()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
  })

  test('teasers render headlines', async ({ page }) => {
    await expect(page.getByText('Simple Teaser Component')).toBeVisible()
    await expect(page.getByText('End of Component Showcase')).toBeVisible()
  })
})
