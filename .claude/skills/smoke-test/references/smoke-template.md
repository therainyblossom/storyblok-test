# Smoke Test — Template & Examples

## Full Template

```typescript
import { test, expect } from '../fixtures/base'
import { PAGES, NAV } from '../fixtures/test-constants'
import { dismissCookieBanner } from '../fixtures/base'

test.describe('Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieBanner(page)
  })

  test('homepage loads', async ({ page, checkA11y }) => {
    await page.goto(`/${PAGES.home.slug}`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
    await checkA11y()
  })

  test('navigation works', async ({ page }) => {
    await page.goto(`/${PAGES.home.slug}`, { waitUntil: 'networkidle' })
    await page.getByRole('link', { name: NAV.mainMenuItems[0] }).click()
    await page.waitForURL(/.*/, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('listing page shows content', async ({ page }) => {
    await page.goto(`/${PAGES.listing.slug}`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const items = page.locator('[data-component]') // adjust selector
    await expect(items.first()).toBeVisible()
  })

  test('detail page renders', async ({ page }) => {
    await page.goto(`/${PAGES.detail.slug}`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      PAGES.detail.expectedH1Contains,
    )
  })

  test('form is interactive', async ({ page }) => {
    await page.goto(`/${PAGES.form.slug}`, { waitUntil: 'networkidle' })
    const firstField = page.getByLabel(PAGES.form.requiredFields[0], { exact: false })
    await expect(firstField).toBeVisible()
  })
})
```

## Individual Test Examples

### Homepage
```typescript
test('homepage loads', async ({ page, checkA11y }) => {
  await page.goto(`/${PAGES.home.slug}`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('nav')).toBeVisible()
  await expect(page.locator('footer')).toBeVisible()
  await checkA11y()
})
```

### Navigation
```typescript
test('main navigation works', async ({ page }) => {
  await page.goto(`/${PAGES.home.slug}`, { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: NAV.mainMenuItems[0] }).click()
  await page.waitForURL(/.*/, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
```

### Content listing
```typescript
test('listing page shows content', async ({ page }) => {
  await page.goto(`/${PAGES.listing.slug}`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const items = page.locator('[data-component]')
  await expect(items.first()).toBeVisible()
})
```

### Detail page
```typescript
test('detail page renders', async ({ page }) => {
  await page.goto(`/${PAGES.detail.slug}`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    PAGES.detail.expectedH1Contains,
  )
})
```

### Interactive feature
```typescript
test('form is interactive', async ({ page }) => {
  await page.goto(`/${PAGES.form.slug}`, { waitUntil: 'networkidle' })
  const firstField = page.getByLabel(PAGES.form.requiredFields[0], { exact: false })
  await expect(firstField).toBeVisible()
  await firstField.fill('test')
  await expect(firstField).toHaveValue('test')
})
```

## CI Integration (GitHub Actions)

Smoke gates the full suite in `.github/workflows/e2e.yml`. See the workflow file for the full config.

```bash
# Run smoke manually:
npx playwright test e2e/tests/smoke.spec.ts --project=chromium --retries=0
```
