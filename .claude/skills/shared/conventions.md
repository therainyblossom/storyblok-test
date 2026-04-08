# E2E Test Conventions

## File Structure

```
e2e/
├── fixtures/
│   ├── base.ts              # Shared test helpers (goToPage, checkA11y, dismissCookieBanner)
│   └── test-constants.ts    # CMS-dependent values — single source of truth
├── helpers/
│   ├── accessibility.ts     # axe-core wrapper with severity filtering + false-positive handling
│   ├── accessibility-patterns.ts  # Keyboard/ARIA test helpers (modal, tabs, dropdown, headings)
│   └── cookie-consent.ts   # Comprehensive cookie consent dismissal (20+ providers, shadow DOM)
├── pages/
│   ├── BasePage.ts           # Shared page object (header, footer, cookies, responsive, screenshots)
│   └── {Feature}Page.ts      # Feature-specific page objects
├── tests/
│   └── {feature}.spec.ts     # One spec file per feature/page type
└── test-results/             # Auto-generated (gitignored)
```

## Naming

- Test files: `kebab-case.spec.ts`
- Page objects: `PascalCase.ts`
- Test names: describe what the user sees, not what code does
  - Good: `'displays hero image and heading on homepage'`
  - Bad: `'WebsiteHero component renders blok.image'`

## Selectors (priority order)

1. **Role selectors** — `page.getByRole('heading', { name: /welcome/i })`
2. **data-component** — `page.locator('[data-component="..."]')` — for CMS blocks
3. **data-testid** — `page.locator('[data-testid="hero-cta"]')` — when role isn't enough
4. **Semantic HTML** — `page.locator('nav a')`, `page.locator('footer')`

Never use: CSS class names, XPath, complex CSS chains.

## Waiting Strategy

SSR sites render HTML immediately but hydrate asynchronously.

```typescript
// Wait for network to settle
await page.goto('/path', { waitUntil: 'networkidle' })

// Wait for a specific element
await expect(page.locator('[data-component="..."]')).toBeVisible()

// Never use arbitrary sleeps
// BAD: await page.waitForTimeout(3000)
```

## Assertions

Test what users see, not implementation details:

```typescript
// GOOD — structure assertion
await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

// BAD — exact text (editors can change content)
await expect(page.getByRole('heading')).toHaveText('Welcome')
```

## Test Constants

Always import from `e2e/fixtures/test-constants.ts`:

```typescript
import { TEST_DATA } from '../fixtures/test-constants'

// GOOD
await page.goto(`/${TEST_DATA.mainPage}`)

// BAD — hardcoded
await page.goto('/eu/en/products/landing')
```

## Page Objects

Use for any feature with complex interactions:

```typescript
import type { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

export class FeaturePage extends BasePage {
  readonly element: Locator

  constructor(page: Page) {
    super(page)
    this.element = page.locator('[data-component="..."]')
  }
}
```

## Test Isolation

Each test is independent. No shared state between tests. If a test needs specific state, navigate to it explicitly.

## Mobile Testing

```typescript
test('mobile layout', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile-only test')
  // ...
})
```

## Accessibility Testing

Use the `checkA11y` fixture for automated axe-core scans:

```typescript
import { test, expect } from '../fixtures/base'

test('page is accessible', async ({ page, checkA11y }) => {
  await page.goto('/path')
  await checkA11y()                                    // critical/serious → fail
  await checkA11y({ exclude: ['.third-party'] })       // exclude selectors
  await checkA11y({ prepare: true })                   // open <details> before scan
  await checkA11y({ prepare: true, prepareAggressive: true }) // also click accordions/tabs/modals
  await checkA11y({ filterContrast: true })            // remove contrast false positives
})
```

Use keyboard/ARIA helpers for interactive widget testing:

```typescript
import { testModalFocusTrap, testTabNavigation, testDropdownKeyboard, assertHeadingHierarchy } from '../helpers/accessibility-patterns'

await testModalFocusTrap(page, '[role="dialog"]', '#trigger')
await testTabNavigation(page, '.tabs-container')
await testDropdownKeyboard(page, '#language-selector')
await assertHeadingHierarchy(page)
```

## Cookie Consent

Cookie consent is handled automatically by `BasePage.dismissCookieBanner()` or the standalone `dismissCookieConsent()` function. Supports 20+ consent providers including shadow DOM (Usercentrics, CMP, consentmanager).
