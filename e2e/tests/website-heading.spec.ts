import { test, expect } from '../fixtures/base'
import { BasePage } from '../pages/BasePage'
import { PAGES } from '../fixtures/test-constants'

test.describe('WebsiteHeading', () => {
  test.beforeEach(async ({ page, goToPage }) => {
    const basePage = new BasePage(page)
    await goToPage(PAGES.xxl.slug)
    await basePage.dismissCookieBanner()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
  })

  test('left-aligned heading renders with kicker and subtitle', async ({ page }) => {
    await expect(page.getByText('Section Kicker')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Left-Aligned Heading' })).toBeVisible()
    await expect(page.getByText('demonstrates left alignment')).toBeVisible()
  })

  test('center heading without separator renders', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Center Heading Without Separator' })).toBeVisible()
  })

  test('right-aligned heading renders with kicker', async ({ page }) => {
    await expect(page.getByText('Final Section')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Right-Aligned Heading' })).toBeVisible()
  })
})
