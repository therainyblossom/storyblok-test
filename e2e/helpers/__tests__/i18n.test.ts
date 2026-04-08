import { test, expect } from '@playwright/test'
import path from 'path'
import { checkHtmlLang } from '../i18n'

test.describe('checkHtmlLang', () => {
  test.use({ baseURL: undefined })

  test('passes when lang matches', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'test-page.html')}`)
    // test-page.html has lang="en"
    await checkHtmlLang(page, 'en')
  })

  test('throws when lang does not match', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'test-page.html')}`)
    await expect(checkHtmlLang(page, 'de')).rejects.toThrow('does not match expected locale')
  })

  test('throws when lang attribute is missing', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'test-page.html')}`)
    // Remove lang attribute
    await page.evaluate(() => document.documentElement.removeAttribute('lang'))
    await expect(checkHtmlLang(page, 'en')).rejects.toThrow('no lang attribute')
  })
})
