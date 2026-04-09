import { test, expect } from '../fixtures/base'
import { BasePage } from '../pages/BasePage'
import { PAGES } from '../fixtures/test-constants'

/**
 * Layout tests — catch CSS/structural bugs that axe-core doesn't detect.
 * Tests scroll behavior, overflow, stacking, spacing, and responsiveness.
 */
test.describe('Layout', () => {
  test.beforeEach(async ({ page, goToPage }) => {
    const basePage = new BasePage(page)
    await goToPage(PAGES.xxl.slug)
    await basePage.dismissCookieBanner()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })
  })

  // --- Sticky nav ---

  test('nav stays visible after scrolling to bottom', async ({ page }) => {
    const nav = page.locator('#default-header')
    await expect(nav).toBeVisible()

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(300)

    await expect(nav).toBeInViewport()
  })

  test('nav has correct sticky positioning', async ({ page }) => {
    const position = await page.locator('#default-header').evaluate(
      el => getComputedStyle(el).position,
    )
    expect(position).toBe('sticky')
  })

  test('nav z-index is above page content', async ({ page }) => {
    const zIndex = await page.locator('#default-header').evaluate(
      el => parseInt(getComputedStyle(el).zIndex) || 0,
    )
    expect(zIndex).toBeGreaterThanOrEqual(40)
  })

  // --- No horizontal overflow ---

  test('page has no horizontal scrollbar', async ({ page }) => {
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(hasOverflow).toBe(false)
  })

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(hasOverflow).toBe(false)
  })

  // --- Content doesn't overlap nav ---

  test('first content section is below the nav', async ({ page }) => {
    const navBottom = await page.locator('#default-header').evaluate(
      el => el.getBoundingClientRect().bottom,
    )
    const firstSection = page.locator('main section, main > div').first()
    const sectionTop = await firstSection.evaluate(
      el => el.getBoundingClientRect().top,
    )

    // Content should start at or below nav bottom (no overlap)
    expect(sectionTop).toBeGreaterThanOrEqual(navBottom - 1)
  })

  // --- Footer at bottom ---

  test('footer is at the bottom of the page', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    const footerTop = await footer.evaluate(el => el.getBoundingClientRect().top)
    const viewportHeight = await page.evaluate(() => window.innerHeight)

    // Footer should be below the fold on a content-rich page like XXL
    expect(footerTop).toBeGreaterThan(viewportHeight)
  })

  // --- Responsive layout ---

  test('content container does not exceed max width', async ({ page }) => {
    const containerWidth = await page.locator('.max-w-screen-xl').first().evaluate(
      el => el.getBoundingClientRect().width,
    )
    // max-w-screen-xl = 1280px
    expect(containerWidth).toBeLessThanOrEqual(1280)
  })

  test('layout stacks vertically on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('.flex.flex-col.min-h-screen')).toBeVisible({ timeout: 15000 })

    // Grids should collapse to single column — all features visible and stacked
    const features = page.getByText('Feature One')
    await expect(features).toBeVisible()

    // Container should be full-width on mobile
    const containerWidth = await page.locator('.max-w-screen-xl').first().evaluate(
      el => el.getBoundingClientRect().width,
    )
    expect(containerWidth).toBeLessThanOrEqual(375)
  })

  // --- No content hidden by overflow ---

  test('all sections are reachable by scrolling', async ({ page }) => {
    // Scroll to the last teaser to verify nothing is clipped
    const lastTeaser = page.getByText('End of Component Showcase')
    await lastTeaser.scrollIntoViewIfNeeded()
    await expect(lastTeaser).toBeInViewport()
  })
})
