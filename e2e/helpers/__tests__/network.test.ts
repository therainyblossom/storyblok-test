import { test, expect } from '@playwright/test'
import path from 'path'
import { waitForApi } from '../network'

test.describe('waitForApi', () => {
  test.use({ baseURL: undefined })

  test('resolves with matching response', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'test-page.html')}`)

    // Set up a route that responds to /api/test
    await page.route('**/api/test', (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }), contentType: 'application/json' })
    })

    const response = await waitForApi(page, '/api/test', async () => {
      await page.evaluate(() => fetch('/api/test'))
    })

    expect(response.status()).toBe(200)
  })

  test('matches regex patterns', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'test-page.html')}`)

    await page.route('**/api/items/123', (route) => {
      route.fulfill({ status: 200, body: '{}', contentType: 'application/json' })
    })

    const response = await waitForApi(page, /\/api\/items\/\d+/, async () => {
      await page.evaluate(() => fetch('/api/items/123'))
    })

    expect(response.status()).toBe(200)
  })
})
