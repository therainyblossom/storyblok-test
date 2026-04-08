import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'
import { dismissCookieConsent } from '../helpers/cookie-consent'
import { waitForDomStable } from '../helpers/accessibility'

/**
 * Base page object — shared elements present on every page.
 * Extend this for feature-specific page objects.
 */
export class BasePage {
  readonly page: Page
  readonly header: Locator
  readonly footer: Locator
  readonly mainContent: Locator

  constructor(page: Page) {
    this.page = page
    this.header = page.locator('header')
    this.footer = page.locator('footer')
    this.mainContent = page.locator('main')
  }

  async goto(slug: string, locale?: string) {
    const path = locale ? `/${locale}/${slug}` : `/${slug}`
    await this.page.goto(path, { waitUntil: 'networkidle' })
  }

  async dismissCookieBanner() {
    await dismissCookieConsent(this.page)
  }

  /**
   * Run a callback at a specific viewport size, then restore the original size.
   * Accepts named breakpoints or custom { width, height }.
   */
  async testAtBreakpoint(
    breakpoint: 'mobile' | 'tablet' | 'desktop' | { width: number; height: number },
    fn: () => Promise<void>,
  ) {
    const sizes = {
      mobile: { width: 375, height: 812 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1280, height: 800 },
    }

    const original = this.page.viewportSize()
    const target = typeof breakpoint === 'string' ? sizes[breakpoint] : breakpoint

    await this.page.setViewportSize(target)
    await this.page.waitForTimeout(200)

    try {
      await fn()
    } finally {
      if (original) {
        await this.page.setViewportSize(original)
      }
    }
  }

  /**
   * Click a trigger and wait for a dropdown/popover to appear.
   * Infers the dropdown from aria-controls, or falls back to common role selectors.
   */
  async openDropdown(triggerSelector: string, dropdownSelector?: string): Promise<Locator> {
    const trigger = this.page.locator(triggerSelector)
    await trigger.click()

    if (dropdownSelector) {
      const dropdown = this.page.locator(dropdownSelector)
      await expect(dropdown.first()).toBeVisible({ timeout: 3000 })
      return dropdown.first()
    }

    const controlsId = await trigger.getAttribute('aria-controls')
    if (controlsId) {
      const controlled = this.page.locator(`#${controlsId}`)
      await expect(controlled).toBeVisible({ timeout: 3000 })
      return controlled
    }

    const popup = this.page.locator(
      '[role="listbox"], [role="menu"], [data-radix-popper-content-wrapper], .dropdown-menu',
    )
    await expect(popup.first()).toBeVisible({ timeout: 3000 })
    return popup.first()
  }

  /**
   * Execute an action and wait for navigation to complete.
   * Works for both SPA route changes and full page loads.
   */
  async waitForNavigation(action: () => Promise<void>) {
    await Promise.all([
      this.page.waitForURL(/.*/, { waitUntil: 'networkidle' }),
      action(),
    ])
  }

  /**
   * Dismiss any visible modal by pressing Escape, then clicking common close buttons as fallback.
   */
  async dismissModals() {
    // Try Escape key first
    await this.page.keyboard.press('Escape')
    await this.page.waitForTimeout(300)

    // Fallback: click common close button selectors
    const closeButton = this.page.locator(
      '[role="dialog"] button[aria-label="Close"], ' +
        '[role="dialog"] button[aria-label="close"], ' +
        '[role="dialog"] .close, ' +
        '[role="dialog"] [data-dismiss="modal"], ' +
        '[role="dialog"] [data-bs-dismiss="modal"]',
    ).first()

    if (await closeButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await closeButton.click()
    }
  }

  /**
   * Prepare the page for screenshot comparison: dismiss cookies, wait for fonts,
   * wait for images, wait for DOM to stabilize.
   */
  async prepareForScreenshot() {
    await this.dismissCookieBanner()
    await this.page.evaluate(() => document.fonts.ready)
    await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'))
      return Promise.all(
        images
          .filter(img => !img.complete)
          .map(img => new Promise<void>(resolve => {
            img.addEventListener('load', () => resolve())
            img.addEventListener('error', () => resolve())
          })),
      )
    })
    await waitForDomStable(this.page)
  }
}
