import { test, expect } from '../fixtures/base'
import { BasePage } from '../pages/BasePage'
import { PAGES } from '../fixtures/test-constants'

test.describe('Grid & Feature', () => {
  test.beforeEach(async ({ page, goToPage }) => {
    const basePage = new BasePage(page)
    await goToPage(PAGES.xxl.slug)
    await basePage.dismissCookieBanner()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
  })

  test('3-column grid renders all features', async ({ page }) => {
    await expect(page.getByText('Feature One')).toBeVisible()
    await expect(page.getByText('Feature Two')).toBeVisible()
    await expect(page.getByText('Feature Three')).toBeVisible()
  })

  test('2-column grid renders features', async ({ page }) => {
    await expect(page.getByText('Feature Four')).toBeVisible()
    await expect(page.getByText('Feature Five')).toBeVisible()
  })

  test('4-column grid renders features', async ({ page }) => {
    await expect(page.getByText('Feature Six')).toBeVisible()
    await expect(page.getByText('Feature Nine')).toBeVisible()
  })
})
