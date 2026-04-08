import { test, expect } from '@playwright/test'
import path from 'path'
import { dismissCookieConsent } from '../cookie-consent'

test.describe('dismissCookieConsent', () => {
  test.use({ baseURL: undefined })

  test('does not throw on page with no banner', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'test-page.html')}`)
    // Should complete without error — no banner to dismiss
    await dismissCookieConsent(page)
  })

  test('clicks accept button when present', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'test-page.html')}`)

    // Add a fake cookie banner
    let clicked = false
    await page.evaluate(() => {
      const banner = document.createElement('div')
      banner.id = 'cookie-banner'
      const btn = document.createElement('button')
      btn.setAttribute('data-testid', 'uc-accept-all-button')
      btn.textContent = 'Accept all'
      btn.addEventListener('click', () => {
        banner.style.display = 'none'
        ;(window as any).__cookieAccepted = true
      })
      banner.appendChild(btn)
      document.body.appendChild(banner)
    })

    await dismissCookieConsent(page)

    const accepted = await page.evaluate(() => (window as any).__cookieAccepted)
    expect(accepted).toBe(true)
  })
})
