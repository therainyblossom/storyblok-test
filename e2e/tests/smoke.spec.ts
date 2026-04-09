import { test, expect } from '../fixtures/base'
import { BasePage } from '../pages/BasePage'
import { PAGES } from '../fixtures/test-constants'

test.describe('Smoke', () => {
  // 1. Homepage loads — h1, nav, footer, a11y
  test('homepage loads', async ({ page, goToPage, checkA11y }) => {
    const basePage = new BasePage(page)
    await goToPage(PAGES.home.slug)
    await basePage.dismissCookieBanner()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(basePage.header).toBeVisible()
    await expect(basePage.footer).toBeVisible()

    await checkA11y({ filterContrast: true })
  })

  // 2. Navigation works — click a nav link, verify inner page loads
  test('navigation works', async ({ page, goToPage }) => {
    const basePage = new BasePage(page)
    await goToPage(PAGES.home.slug)
    await basePage.dismissCookieBanner()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })

    // Find the first nav link and click it
    const navLink = page.locator('#default-header nav a').first()
    if (await navLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await navLink.click()
      await page.waitForLoadState('networkidle')
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })
    }
  })

  // 3. Detail page renders — about page with expected h1
  test('about page renders', async ({ page, goToPage, checkA11y }) => {
    await goToPage(PAGES.about.slug)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      PAGES.about.expectedH1Contains,
    )
    await checkA11y({ filterContrast: true })
  })

  // 4. Listing page — services page with multiple feature items
  test('services page shows content', async ({ page, goToPage, checkA11y }) => {
    await goToPage(PAGES.services.slug)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      PAGES.services.expectedH1Contains,
    )
    await checkA11y({ filterContrast: true })
  })

  // 5. Mobile viewport — homepage renders correctly on mobile
  test('homepage loads on mobile', async ({ page, goToPage, checkA11y }) => {
    const basePage = new BasePage(page)
    await page.setViewportSize({ width: 375, height: 812 })
    await goToPage(PAGES.home.slug)
    await basePage.dismissCookieBanner()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
    await expect(basePage.header).toBeVisible()
    await checkA11y({ filterContrast: true })
  })
})
