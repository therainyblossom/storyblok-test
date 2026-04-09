---
name: visual-regression
description: Create and run Playwright screenshot tests to catch visual regressions. Captures baselines and detects pixel-level diffs on subsequent runs.
disable-model-invocation: true
argument-hint: [page-url-or-feature] [--update-baselines]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Read Write Edit Glob Grep Agent
---

# Visual Regression Testing

Pixel-level screenshot comparison across deploys.

## Phase 0: Load Context (mandatory)

1. Read `shared/conventions.md`
2. Read `./e2e/fixtures/test-constants.ts`
3. Glob `./e2e/tests/*-visual.spec.ts`
4. Glob `./e2e/tests/__screenshots__/`

## How It Works

1. First run: captures screenshots as baselines in `__screenshots__/`
2. Subsequent runs: compares against baselines, fails if diff > threshold
3. Update: `--update-snapshots` to accept new baselines

## Writing Visual Tests

Use `BasePage.prepareForScreenshot()` which handles cookie dismissal, font loading, image loading, and DOM stability:

```typescript
import { test, expect } from '@playwright/test'
import { BasePage } from '../pages/BasePage'

test.describe('Feature — Visual', () => {
  test('full page', async ({ page }) => {
    const basePage = new BasePage(page)
    await page.goto('/path', { waitUntil: 'networkidle' })
    await basePage.prepareForScreenshot()
    await expect(page).toHaveScreenshot('page-name.png', { fullPage: true })
  })

  test('specific component', async ({ page }) => {
    const basePage = new BasePage(page)
    await page.goto('/path', { waitUntil: 'networkidle' })
    await basePage.prepareForScreenshot()
    const component = page.locator('[data-component="..."]')
    await expect(component).toHaveScreenshot('component.png')
  })
})
```

## Dynamic Content

```typescript
// Mask changing areas
await expect(page).toHaveScreenshot('page.png', {
  mask: [page.locator('.dynamic-date')],
})

// Higher tolerance for content-heavy areas
await expect(page).toHaveScreenshot('grid.png', { maxDiffPixelRatio: 0.05 })
```

## Commands

```bash
# Capture baselines
npx playwright test *-visual.spec.ts --update-snapshots --project=chromium

# Verify
npx playwright test *-visual.spec.ts --project=chromium

# After intentional changes
npx playwright test *-visual.spec.ts --update-snapshots
git add e2e/tests/__screenshots__/
```
