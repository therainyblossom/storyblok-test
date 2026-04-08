# Flaky Test Patterns

The 10 most common causes of flaky tests and their fixes. Check these first when triaging a flake.

## 1. Asserting before API response loads

**Symptom**: Test passes locally, fails in CI. Assertion fires before data renders.

```typescript
// BAD — assertion runs before API responds
await page.getByRole('button', { name: 'Search' }).click()
await expect(page.locator('.results')).toBeVisible() // flaky!

// GOOD — wait for the API call to complete first
import { waitForApi } from '../helpers/network'
const response = await waitForApi(page, '/api/search', async () => {
  await page.getByRole('button', { name: 'Search' }).click()
})
await expect(page.locator('.results')).toBeVisible()
```

## 2. Using `waitForTimeout` instead of explicit waits

**Symptom**: Test passes with 3000ms timeout, fails with 2000ms. Timing-dependent.

```typescript
// BAD — arbitrary sleep
await page.waitForTimeout(3000)

// GOOD — wait for the actual condition
await expect(page.locator('.content')).toBeVisible()
// or for DOM stability:
import { waitForDomStable } from '../helpers/accessibility'
await waitForDomStable(page)
```

## 3. `networkidle` on pages with streaming or polling

**Symptom**: Test hangs or times out on pages with WebSockets, SSE, or polling APIs.

```typescript
// BAD — never settles if page has active connections
await page.goto('/dashboard', { waitUntil: 'networkidle' })

// GOOD — wait for DOM ready, then wait for specific content
await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
await expect(page.getByRole('heading')).toBeVisible()
```

## 4. Clicking during CSS animation or transition

**Symptom**: Click lands on wrong element or misses because element is moving.

```typescript
// BAD — element is mid-animation
await page.locator('.dropdown-item').click()

// GOOD — wait for animations to finish
await page.locator('.dropdown').evaluate(
  (el) => Promise.all(el.getAnimations().map((a) => a.finished))
)
await page.locator('.dropdown-item').click()

// or disable animations globally in playwright.config.ts:
// use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' }
```

## 5. Stale element after DOM re-render

**Symptom**: `Element is not attached to the DOM` error.

```typescript
// BAD — locator cached before re-render
const button = page.locator('.submit')
await page.selectOption('#type', 'premium') // triggers re-render
await button.click() // may reference old DOM node

// GOOD — Playwright locators auto-retry by default, but chain them:
await page.selectOption('#type', 'premium')
await page.locator('.submit').click() // fresh query every time
```

## 6. Test order dependency

**Symptom**: Test passes when run alone, fails when run with other tests.

```typescript
// BAD — test 2 depends on state from test 1
test('test 1 - apply filter', async ({ page }) => { ... })
test('test 2 - check filtered results', async ({ page }) => { ... }) // needs filter from test 1

// GOOD — each test is independent
test.beforeEach(async ({ page }) => {
  await page.goto('/listing', { waitUntil: 'networkidle' })
})
test('filtered results', async ({ page }) => {
  await page.selectOption('#filter', 'Guides') // set own state
  await expect(page.locator('.results')).toBeVisible()
})
```

## 7. Cookie or localStorage leaking between tests

**Symptom**: Test passes first time, fails on second run. Works after clearing browser data.

```typescript
// BAD — previous test's cookies affect this test
test('shows onboarding for new users', async ({ page }) => {
  await page.goto('/')
  // Fails because previous test completed onboarding and set a cookie
})

// GOOD — Playwright creates fresh context per test by default.
// If sharing context, clear state explicitly:
test.beforeEach(async ({ context }) => {
  await context.clearCookies()
})
```

## 8. Viewport-dependent assertion without explicit viewport

**Symptom**: Passes on developer's 1440px screen, fails in CI's 1280px viewport.

```typescript
// BAD — assumes specific viewport
await expect(page.locator('.sidebar')).toBeVisible()

// GOOD — set viewport explicitly when testing layout
await page.setViewportSize({ width: 1280, height: 800 })
await expect(page.locator('.sidebar')).toBeVisible()

// or use BasePage helper:
await basePage.testAtBreakpoint(1280, 800, async () => {
  await expect(page.locator('.sidebar')).toBeVisible()
})
```

## 9. Race between navigation and assertion

**Symptom**: Assertion fires on the old page before navigation completes.

```typescript
// BAD — click triggers navigation but assertion runs on old page
await page.getByRole('link', { name: 'Products' }).click()
await expect(page.getByRole('heading')).toHaveText('Products') // may check old page

// GOOD — wait for URL to change first
await page.getByRole('link', { name: 'Products' }).click()
await page.waitForURL('**/products**')
await expect(page.getByRole('heading')).toHaveText('Products')

// or use BasePage helper:
await basePage.waitForNavigation(async () => {
  await page.getByRole('link', { name: 'Products' }).click()
})
```

## 10. Visual regression diff from font rendering

**Symptom**: Screenshot tests fail with tiny text differences across runs. No code changed.

```typescript
// BAD — pixel-perfect comparison on text-heavy page
await expect(page).toHaveScreenshot('page.png')

// GOOD — increase tolerance for text-heavy pages
await expect(page).toHaveScreenshot('page.png', { maxDiffPixelRatio: 0.02 })

// or mask dynamic/text-heavy areas:
await expect(page).toHaveScreenshot('page.png', {
  mask: [page.locator('.dynamic-date'), page.locator('.user-content')],
})

// or wait for fonts to load first:
await page.evaluate(() => document.fonts.ready)
```

## Quick Diagnosis

| Symptom | Most likely pattern | Fix |
|---------|-------------------|-----|
| Passes locally, fails in CI | #1, #3, #8 | Wait for API, check viewport |
| Passes alone, fails in suite | #6, #7 | Test isolation, clear state |
| Passes 9/10 times | #1, #4, #9 | Race condition, wait explicitly |
| Passes then fails on retry | #5, #7 | Stale DOM, cookie leak |
| Screenshot diff, no code change | #10 | Font rendering, increase tolerance |
| Hangs or times out | #3 | Streaming/polling, don't use networkidle |
