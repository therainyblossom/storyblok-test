import { test, expect } from '../fixtures/base'
import { BasePage } from '../pages/BasePage'
import { PAGES } from '../fixtures/test-constants'

test.describe('Website Teaser', () => {
  test.beforeEach(async ({ page, goToPage }) => {
    const basePage = new BasePage(page)
    await goToPage(PAGES.services.slug)
    await basePage.dismissCookieBanner()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
  })

  test('teaser section renders with heading and cards', async ({ page }) => {
    // WebsiteHeading renders inside the teaser section
    const teaserSection = page.locator('section').filter({ hasText: 'Our Solutions' })
    await expect(teaserSection).toBeVisible()

    // Heading renders with kicker, title, and subtitle
    await expect(teaserSection.getByText('Explore')).toBeVisible()
    await expect(teaserSection.getByRole('heading', { name: /Our Solutions/i })).toBeVisible()
    await expect(teaserSection.getByText('Discover what we can do')).toBeVisible()

    // Separator line renders
    await expect(teaserSection.locator('.bg-primary-600').first()).toBeVisible()
  })

  test('teaser cards are visible with titles', async ({ page }) => {
    const teaserSection = page.locator('section').filter({ hasText: 'Our Solutions' })

    // All 3 teaser items should be visible
    const cards = teaserSection.locator('a.group')
    await expect(cards).toHaveCount(3)

    // Each card has an h3 title
    await expect(teaserSection.getByRole('heading', { name: 'Web Development' })).toBeVisible()
    await expect(teaserSection.getByRole('heading', { name: 'CMS Integration' })).toBeVisible()
    await expect(teaserSection.getByRole('heading', { name: 'Accessibility Audits' })).toBeVisible()
  })

  test('teaser cards are links', async ({ page }) => {
    const teaserSection = page.locator('section').filter({ hasText: 'Our Solutions' })
    const cards = teaserSection.locator('a.group')

    // Each card should be a link
    for (let i = 0; i < await cards.count(); i++) {
      const href = await cards.nth(i).getAttribute('href')
      expect(href).toBeTruthy()
    }
  })

  test('teaser grid adapts to item count', async ({ page }) => {
    const teaserSection = page.locator('section').filter({ hasText: 'Our Solutions' })
    const grid = teaserSection.locator('.grid')

    // 3 items should have lg:grid-cols-3 class
    await expect(grid).toHaveClass(/lg:grid-cols-3/)
  })

  test('teaser section passes accessibility checks', async ({ page, checkA11y }) => {
    await checkA11y({ filterContrast: true })
  })
})
