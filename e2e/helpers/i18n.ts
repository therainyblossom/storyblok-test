import type { Page } from '@playwright/test'
import { LOCALES } from '../fixtures/test-constants'

/**
 * Run an assertion across all configured locales.
 *
 * Usage:
 *   await testAcrossLocales(page, { en: 'en/resources', de: 'de/ressourcen', fr: 'fr/ressources' }, async (page, locale) => {
 *     await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
 *   })
 */
export async function testAcrossLocales(
  page: Page,
  slugByLocale: Record<string, string>,
  fn: (page: Page, locale: string) => Promise<void>,
): Promise<void> {
  for (const locale of LOCALES.all) {
    const slug = slugByLocale[locale]
    if (!slug) continue
    await page.goto(`/${slug}`, { waitUntil: 'networkidle' })
    await fn(page, locale)
  }
}

/**
 * Check that `<html lang>` matches the expected locale.
 *
 * **Limitation**: This only checks the `lang` attribute, not whether visible text
 * is actually translated. Many sites set `lang` correctly at the server level even
 * when content falls back to the default language. Use this as a quick sanity check,
 * not as proof that translations are working.
 */
export async function checkHtmlLang(page: Page, expectedLocale: string): Promise<void> {
  const htmlLang = await page.locator('html').getAttribute('lang')
  if (!htmlLang) {
    throw new Error(`<html> has no lang attribute — expected "${expectedLocale}"`)
  }
  if (!htmlLang.startsWith(expectedLocale)) {
    throw new Error(
      `<html lang="${htmlLang}"> does not match expected locale "${expectedLocale}"`,
    )
  }
}

/** @deprecated Use `checkHtmlLang` instead */
export const verifyNotDefaultLocale = checkHtmlLang
