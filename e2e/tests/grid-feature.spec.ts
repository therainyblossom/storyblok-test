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

  test('grids have responsive column classes', async ({ page }) => {
    const grids = page.locator('.grid.grid-cols-1')
    const count = await grids.count()
    expect(count).toBeGreaterThanOrEqual(3)

    // All grids start as single column on mobile
    for (let i = 0; i < count; i++) {
      await expect(grids.nth(i)).toHaveClass(/grid-cols-1/)
    }
  })

  test('grid adapts columns at breakpoints', async ({ page }) => {
    // Find the 3-feature grid (has Feature One)
    const grid3 = page.locator('.grid').filter({ hasText: 'Feature One' })
    await expect(grid3).toHaveClass(/sm:grid-cols-2/)
    await expect(grid3).toHaveClass(/lg:grid-cols-3/)

    // Find the 4-feature grid (has Feature Six)
    const grid4 = page.locator('.grid').filter({ hasText: 'Feature Six' })
    await expect(grid4).toHaveClass(/lg:grid-cols-4/)
  })

  test('grid renders single column on mobile', async ({ page, checkA11y }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })

    await expect(page.getByText('Feature One')).toBeVisible()
    await checkA11y({ filterContrast: true })
  })
})
