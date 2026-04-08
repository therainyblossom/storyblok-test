import type { Page } from '@playwright/test'

const ACCEPT_SELECTORS = [
  '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
  '#CybotCookiebotDialogBodyButtonAccept',
  '#onetrust-accept-btn-handler',
  '[data-cookieconsent="accept"]',
  'button[data-cookie-accept]',
  '[data-testid="uc-accept-all-button"]',
  '[data-testid*="accept"]',
  '[data-testid*="cookie"] button',
  '[class*="cookie"] button[class*="accept"]',
  '[id*="cookie"] button[id*="accept"]',
  'button[class*="accept"]',
  'button[class*="agree"]',
  'button[class*="allow"]',
  'button[id*="accept"]',
  'button[id*="agree"]',
  // consentmanager.de
  '.cmpboxbtn.cmpboxbtnyes',
  '.cmpbox .cmpboxbtnyes',
  'a.cmpboxbtn.cmpboxbtnyes',
  '.cmpboxbtns .cmpboxbtnyes',
]

const ACCEPT_BUTTON_LABELS = [
  'Cookies aktivieren',
  'Alle akzeptieren',
  'Alle Cookies akzeptieren',
  'Accept all',
  'Accept cookies',
  'Allow all',
]

const SHADOW_HOST_SELECTORS = [
  '[id="usercentrics-cmp-ui"]',
  '[id*="cookie"]',
  '[id*="consent"]',
  '[id*="cmp"]',
  '[class*="cookie-banner"]',
  '[class*="consent"]',
]

const SHADOW_ACCEPT_SELECTORS = [
  '.accept.uc-accept-button',
  'button[class*="accept"]',
  'button[class*="agree"]',
  'button[class*="allow"]',
  '[data-testid*="accept"]',
  '#accept',
  '.accept',
]

/**
 * Dismiss cookie consent banners across common providers.
 *
 * Three-phase strategy:
 * 1. Shadow DOM — handles Usercentrics, CMP, and other shadow-root banners
 * 2. Regular DOM — tries 19 CSS selectors for major consent providers
 * 3. Text fallback — matches button labels (EN + DE) via getByRole
 *
 * Note: closed shadow roots (mode: 'closed') are not accessible to this approach.
 */
export async function dismissCookieConsent(page: Page): Promise<void> {
  // Wait for potential cookie banner to appear (consent scripts are lazy-loaded)
  await page.waitForTimeout(2000)

  // Phase 1: Shadow DOM
  const shadowClicked = await page.evaluate(
    ({ hostSelectors, acceptSelectors }) => {
      for (const hostSel of hostSelectors) {
        const hosts = document.querySelectorAll(hostSel)
        for (const host of hosts) {
          const shadow = host.shadowRoot
          if (!shadow) continue
          for (const btnSel of acceptSelectors) {
            const btn = shadow.querySelector(btnSel) as HTMLElement
            if (btn) {
              btn.click()
              return true
            }
          }
        }
      }
      return false
    },
    { hostSelectors: SHADOW_HOST_SELECTORS, acceptSelectors: SHADOW_ACCEPT_SELECTORS },
  )

  if (shadowClicked) {
    await page.waitForTimeout(1000)
  }

  // Phase 2: Regular DOM selectors
  for (const selector of ACCEPT_SELECTORS) {
    const btn = page.locator(selector).first()
    if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
      await btn.click()
      await page.waitForTimeout(1000)
      break
    }
  }

  // Phase 3: Text-based fallback for secondary consent buttons
  for (const label of ACCEPT_BUTTON_LABELS) {
    const btn = page.getByRole('button', { name: label, exact: true }).first()
    if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
      await btn.click()
      await page.waitForTimeout(1000)
    }
  }
}
