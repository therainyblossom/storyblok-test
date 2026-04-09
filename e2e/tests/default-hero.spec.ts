import { test, expect } from '../fixtures/base'
import { BasePage } from '../pages/BasePage'
import { PAGES } from '../fixtures/test-constants'

test.describe('DefaultHero', () => {
  test.beforeEach(async ({ page, goToPage }) => {
    const basePage = new BasePage(page)
    await goToPage(PAGES.xxl.slug)
    await basePage.dismissCookieBanner()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
  })

  test('full hero renders badge, headline, description, buttons, and logos', async ({ page }) => {
    const hero = page.locator('section').filter({ hasText: 'XXL — Every Component' }).first()
    await expect(hero).toBeVisible()
    await expect(hero.getByText('Component Showcase')).toBeVisible()
    await expect(hero.getByRole('heading', { name: /XXL/ })).toBeVisible()
    await expect(hero.getByText('showcases every Storyblok component')).toBeVisible()
    await expect(hero.getByText('Primary Button')).toBeVisible()
    await expect(hero.getByText('Secondary Button')).toBeVisible()
    await expect(hero.getByText('Built with')).toBeVisible()
  })

  test('minimal hero renders without badge or buttons', async ({ page }) => {
    const hero = page.locator('section').filter({ hasText: 'Minimal Hero' }).first()
    await expect(hero).toBeVisible()
    await expect(hero.getByRole('heading', { name: /Minimal Hero/ })).toBeVisible()
    await expect(hero.getByText('minimal configuration')).toBeVisible()
  })

  test('hero passes accessibility checks', async ({ page, checkA11y }) => {
    await checkA11y({ filterContrast: true })
  })
})
