import { test, expect } from '../fixtures/base'
import { BasePage } from '../pages/BasePage'
import { PAGES } from '../fixtures/test-constants'

test.describe('WebsiteTeaser', () => {
  test.beforeEach(async ({ page, goToPage }) => {
    const basePage = new BasePage(page)
    await goToPage(PAGES.xxl.slug)
    await basePage.dismissCookieBanner()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
  })

  test('3-item teaser renders heading and cards', async ({ page }) => {
    const section = page.locator('section').filter({ hasText: 'Teaser Card Grid' })
    await expect(section).toBeVisible()
    await expect(section.getByText('Explore')).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Teaser Card Grid' })).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Card One' })).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Card Three' })).toBeVisible()
    await expect(section.locator('.grid')).toHaveClass(/lg:grid-cols-3/)
  })

  test('4-item teaser renders with 4 columns', async ({ page }) => {
    const section = page.locator('section').filter({ hasText: 'Four-Column Teaser Grid' })
    await expect(section).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Alpha' })).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Delta' })).toBeVisible()
    await expect(section.locator('.grid')).toHaveClass(/lg:grid-cols-4/)
  })

  test('teaser cards are navigable links', async ({ page }) => {
    const section = page.locator('section').filter({ hasText: 'Teaser Card Grid' })
    const cards = section.locator('a.group')
    expect(await cards.count()).toBe(3)
    for (let i = 0; i < 3; i++) {
      expect(await cards.nth(i).getAttribute('href')).toBeTruthy()
    }
  })
})
