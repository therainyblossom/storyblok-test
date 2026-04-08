# E2E Testing — How-To Guide

End-to-end tests using [Playwright](https://playwright.dev/).

## Quick Start

```bash
cd {{FRONTEND_DIR}}

# Run all tests against staging
npx playwright test --project=chromium

# Run a specific test file
npx playwright test e2e/tests/{feature}.spec.ts --project=chromium

# Interactive debugging
npx playwright test --ui

# Desktop + mobile
npx playwright test e2e/tests/{feature}.spec.ts
```

## Project Structure

```
e2e/
├── fixtures/
│   ├── base.ts              # Test fixtures: goToPage, checkA11y, reportA11y
│   └── test-constants.ts    # CMS values, locales, breakpoints — single source of truth
├── helpers/
│   ├── accessibility.ts     # axe-core wrapper + DOM stability + contrast filtering
│   ├── accessibility-patterns.ts  # Keyboard/ARIA helpers (modal, tabs, dropdown, headings)
│   ├── cookie-consent.ts   # Cookie banner dismissal (20+ providers, shadow DOM)
│   └── i18n.ts             # Multi-locale test helpers
├── pages/
│   ├── BasePage.ts          # Shared page object (nav, cookies, responsive, screenshots)
│   └── {Feature}Page.ts     # Feature-specific page objects
├── reporters/
│   └── a11y-reporter.ts    # Merged accessibility report (HTML + JSON)
├── tests/
│   └── {feature}.spec.ts    # One file per feature
├── reports/
│   └── a11y/               # Generated: a11y-report.html, a11y-results.json
└── __screenshots__/         # Visual regression baselines (committed)
```

## Writing Tests

### With Claude Code

```
/e2e-test accordion component
```

Claude reads the code, derives requirements, presents a test plan, writes and runs the tests.

### Manually

Always import from `fixtures/base` (not `@playwright/test`) to get the extended fixtures:

```typescript
import { test, expect } from '../fixtures/base'
import { PAGES } from '../fixtures/test-constants'

test.describe('My Feature', () => {
  test('does the expected thing', async ({ page, goToPage, checkA11y }) => {
    await goToPage(PAGES.home.slug)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await checkA11y()
  })
})
```

### Available Fixtures

| Fixture | Usage |
|---------|-------|
| `goToPage(slug, locale?)` | Navigate to a page with optional locale prefix |
| `checkA11y(options?)` | Run axe-core WCAG 2.1 AA scan (results auto-attached to reporter) |
| `reportA11y(findings)` | Report manual a11y findings (from keyboard/ARIA helpers with `{ collect: true }`) |

## Key Rules

### Use test constants
```typescript
// BAD
await page.goto('/path?highlight=hardcoded-slug')

// GOOD
import { PAGES } from '../fixtures/test-constants'
await goToPage(PAGES.listing.slug)
```

### Assert structure, not text
```typescript
// BAD — breaks when editor changes content
await expect(heading).toHaveText('Welcome')

// GOOD
await expect(heading).toBeVisible()
```

### Selector priority
1. `getByRole()` — best for accessibility
2. `[data-component]` — for CMS blocks
3. `[data-testid]` — when role isn't enough
4. Semantic HTML — `header`, `footer`, `nav`

Never: Tailwind classes, XPath.

### Wait correctly
```typescript
// GOOD
await page.goto('/path', { waitUntil: 'networkidle' })

// BAD
await page.waitForTimeout(3000)
```

## Accessibility Testing

### Automated (axe-core)

The `checkA11y` fixture runs axe-core with WCAG 2.1 AA tags. Critical/serious violations fail the test; moderate/minor log warnings.

```typescript
test('page is accessible', async ({ page, checkA11y }) => {
  await page.goto('/my-page')
  await checkA11y()                              // basic scan
  await checkA11y({ exclude: ['.third-party'] }) // exclude selectors
  await checkA11y({ prepare: true })             // open <details> elements first
  await checkA11y({ prepare: true, prepareAggressive: true }) // also click accordions/tabs/modals (may cause side effects)
  await checkA11y({ filterContrast: true })      // remove contrast false positives
  await checkA11y({ warnOnly: true })            // log all, never fail
})
```

### Manual (keyboard/ARIA)

Use helpers from `helpers/accessibility-patterns.ts`:

```typescript
import { testModalFocusTrap, testTabNavigation, testDropdownKeyboard, assertHeadingHierarchy } from '../helpers/accessibility-patterns'

await testModalFocusTrap(page, '[role="dialog"]', '#open-btn')
await testTabNavigation(page, '.tabs-container')
await testDropdownKeyboard(page, '#language-selector')
await assertHeadingHierarchy(page)
```

To collect findings for the reporter instead of throwing:

```typescript
test('page passes a11y checks', async ({ page, checkA11y, reportA11y }) => {
  await page.goto('/my-page')
  await checkA11y()
  const findings = await assertHeadingHierarchy(page, { collect: true })
  reportA11y(findings)
})
```

### Accessibility Reporter

Results from `checkA11y` and `reportA11y` are automatically merged into a scored HTML + JSON report at `e2e/reports/a11y/`. The reporter runs on every `npx playwright test` invocation.

## Waiting for API Responses

Use `waitForApi` to prevent asserting before data loads (the #1 cause of flaky tests):

```typescript
import { waitForApi } from '../helpers/network'

const response = await waitForApi(page, '/api/search', async () => {
  await page.getByRole('button', { name: 'Search' }).click()
})
expect(response.status()).toBe(200)
await expect(page.locator('.results')).toBeVisible()
```

## Cookie Consent

Cookie banners are handled automatically by helpers. Supports 20+ consent providers including shadow DOM (Usercentrics, CMP, consentmanager):

```typescript
import { dismissCookieBanner } from '../fixtures/base'

// In a fixture-based test:
await dismissCookieBanner(page)

// In a page object:
const basePage = new BasePage(page)
await basePage.dismissCookieBanner()
```

## Responsive Testing

Use `BasePage.testAtBreakpoint()` with constants from `test-constants.ts`:

```typescript
import { BasePage } from '../pages/BasePage'
import { BREAKPOINTS } from '../fixtures/test-constants'

const basePage = new BasePage(page)
await basePage.testAtBreakpoint(BREAKPOINTS.mobile.width, BREAKPOINTS.mobile.height, async () => {
  await expect(page.locator('.mobile-menu-toggle')).toBeVisible()
})
```

Standard breakpoints: `mobile` (375x812), `tablet` (768x1024), `desktop` (1280x800).

## i18n Testing

Use `testAcrossLocales` to run assertions for each locale:

```typescript
import { testAcrossLocales, checkHtmlLang } from '../helpers/i18n'

await testAcrossLocales(page, { en: 'en/resources', de: 'de/ressourcen' }, async (page, locale) => {
  await checkHtmlLang(page, locale) // checks <html lang>, not actual text translation
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
```

Or use `goToPage` with a locale prefix:

```typescript
await goToPage(PAGES.listing.slug)                // default locale
await goToPage(PAGES.listing.slugSecondary)        // secondary locale slug
```

## BasePage Methods

When using page objects, `BasePage` provides:

| Method | Purpose |
|--------|---------|
| `goto(slug, locale?)` | Navigate with optional locale prefix |
| `dismissCookieBanner()` | Dismiss cookie consent banner |
| `testAtBreakpoint(w, h, fn)` | Run callback at viewport size, then restore |
| `waitForNavigation(action)` | Execute action and wait for URL change |
| `dismissModals()` | Close modals via Escape + close button fallback |
| `prepareForScreenshot()` | Dismiss cookies, wait for fonts/images/DOM stability |

## Visual Regression

```bash
# Capture baselines
npx playwright test *-visual.spec.ts --update-snapshots --project=chromium

# Verify
npx playwright test *-visual.spec.ts --project=chromium

# After visual changes: update + review + commit
npx playwright test *-visual.spec.ts --update-snapshots
git diff --stat e2e/tests/__screenshots__/
git add e2e/tests/__screenshots__/
```

Use `BasePage.prepareForScreenshot()` before capturing:

```typescript
const basePage = new BasePage(page)
await basePage.prepareForScreenshot()
await expect(page).toHaveScreenshot('page.png', { fullPage: true })
```

## Commands

| Command | What it does |
|---------|-------------|
| `npx playwright test` | All tests, all projects |
| `npx playwright test --project=chromium` | Desktop only |
| `npx playwright test --project=mobile-chrome` | Mobile only |
| `npx playwright test --ui` | Interactive UI |
| `npx playwright test --grep "filter"` | Matching tests |
| `npx playwright test --update-snapshots` | Update visual baselines |
| `npx playwright test --trace on` | Capture trace |
| `npx playwright test --headed` | Watch browser |

## Debugging

| Method | Command |
|--------|---------|
| Screenshots | Check `e2e/test-results/` after failure |
| Trace viewer | `npx playwright show-trace e2e/test-results/{folder}/trace.zip` |
| UI mode | `npx playwright test --ui` |
| Headed mode | `npx playwright test --headed --project=chromium` |
| A11y report | Open `e2e/reports/a11y/a11y-report.html` |

## Claude Code Skills

| Task | Command |
|------|---------|
| Pre-flight check | `/preflight` |
| Smoke test | `/smoke-test write\|run` |
| Post-deploy diff | `/post-deploy-diff --check` |
| Write e2e tests | `/e2e-test {feature}` |
| QA audit | `/qa-audit {page}` |
| Run regression suite | `/qa-regression` |
| Hunt for bugs | `/bug-hunter {feature}` |
| Accessibility audit | `/qa-a11y {page}` |
| Verify bug reports | `/qa-verify {report}` |
| Visual regression | `/visual-regression {feature}` |
| SEO audit | `/seo-audit {page}` |
| Performance audit | `/perf-audit {page}` |
| Link checker | `/link-check {page}` |
| Security headers | `/security-headers {url}` |
| Content quality | `/content-governance {page}` |
| Auth profiles | `/setup-profiles create\|list\|refresh` |
| Manage test fixtures | `/test-data setup\|teardown\|audit` |
| Extract requirements | `/req-extract {source}` |
| Validate against spec | `/req-validate {feature}` |
| Coverage gaps | `/req-coverage {feature}` |

## CI Integration (GitHub Actions)

The toolkit includes a ready-to-use workflow at `.github/workflows/e2e.yml` that runs on every pull request:

```
PR opened → Preflight (10s) → Smoke (2 min) → Full Suite → PR Comment
```

### Pipeline stages

| Stage | What it does | Fails PR if |
|-------|-------------|-------------|
| **Preflight** | Checks staging is reachable | Staging is down or returns 5xx |
| **Smoke** | Runs `smoke.spec.ts` with 0 retries | Any critical-path test fails |
| **Full Suite** | Runs all tests with 2 retries | New regressions found |
| **Report** | Posts summary comment on the PR | (always runs) |

### Required GitHub Secrets

Set in **Settings → Secrets and variables → Actions**:

| Secret | Required | Purpose |
|--------|----------|---------|
| `STAGING_URL` | Yes | Staging environment URL |
| `BASIC_AUTH_USER` | If auth | Basic auth username |
| `BASIC_AUTH_PASSWORD` | If auth | Basic auth password |

### What the PR comment shows

Every PR gets an auto-updating comment with:
- Pass/fail/skip counts
- Accessibility score
- Link to the full HTML report in artifacts

### Customizing

Edit `.github/workflows/e2e.yml`:
- `FRONTEND_DIR` — path to your frontend directory
- `timeout-minutes` — adjust per stage
- Add `--project=mobile-chrome` to test mobile too
- Add more test files to the smoke stage if needed
