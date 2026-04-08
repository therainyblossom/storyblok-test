import type { Page, Response } from '@playwright/test'

/**
 * Execute an action and wait for a matching API response to complete.
 * Prevents the #1 flake pattern: asserting before data loads.
 *
 * Usage:
 *   const response = await waitForApi(page, '/api/products', async () => {
 *     await page.getByRole('button', { name: 'Load more' }).click()
 *   })
 *   expect(response.status()).toBe(200)
 */
export async function waitForApi(
  page: Page,
  urlPattern: string | RegExp,
  action: () => Promise<void>,
  options?: { timeout?: number },
): Promise<Response> {
  const timeout = options?.timeout ?? 10000

  const matcher = typeof urlPattern === 'string'
    ? (url: string) => url.includes(urlPattern)
    : (url: string) => urlPattern.test(url)

  const [response] = await Promise.all([
    page.waitForResponse((res) => matcher(res.url()), { timeout }),
    action(),
  ])

  return response
}
