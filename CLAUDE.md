# CLAUDE.md

## Project

- **Framework**: Nuxt 3 (Vue 3, Composition API) with Storyblok CMS
- **Deployment**: GitHub Pages (static SPA, ssr: false)
- **Space ID**: 291713566231447
- **Storyblok region**: EU

## Stack

- **Test framework**: Playwright (`@playwright/test`)
- **Accessibility**: axe-core (`@axe-core/playwright`)
- **Test dir**: `e2e/`
- **Staging**: `https://therainyblossom.github.io/storyblok-test/`

## Rules

Testing conventions are in `.claude/rules/testing.md`. Key points:

- Import from `fixtures/base`, not `@playwright/test`
- Import data from `fixtures/test-constants`, never hardcode
- Selectors: `getByRole()` > `[data-component]` > `[data-testid]`
- Wait for conditions, never use `waitForTimeout()`
- Assert structure, not exact text
- Call `checkA11y()` at the end of every test
- Use Page Object Model for complex features

## Workflow

```
/preflight → /smoke-test run → /qa-regression (full suite)
```

After audits, always verify findings with `/qa-verify` before filing bugs.

## Helpers

| Helper | Import from | Purpose |
|--------|------------|---------|
| `checkA11y()` | `fixtures/base` | axe-core WCAG 2.1 AA scan |
| `reportA11y()` | `fixtures/base` | Attach manual a11y findings to reporter |
| `goToPage()` | `fixtures/base` | Locale-aware navigation |
| `dismissCookieBanner()` | `fixtures/base` | Cookie consent dismissal |
| `waitForApi()` | `helpers/network` | Wait for API response before asserting |
| `testAcrossLocales()` | `helpers/i18n` | Run assertion for each locale |
| `waitForDomStable()` | `helpers/accessibility` | Wait for DOM mutations to settle |
| `assertHeadingHierarchy()` | `helpers/accessibility-patterns` | Verify heading levels |
| `testModalFocusTrap()` | `helpers/accessibility-patterns` | Test modal focus cycling |
| `testTabNavigation()` | `helpers/accessibility-patterns` | Test tab widget keyboard nav |
| `testDropdownKeyboard()` | `helpers/accessibility-patterns` | Test dropdown keyboard nav |

## Auto E2E Test Generation (CI)

On every PR, the `auto-test.yml` workflow runs Claude Code to:
1. Read the PR diff and identify changed components/pages
2. Generate or update Playwright test files in `e2e/tests/`
3. Run tests and report results as PR comments

When generating tests in CI:
- Never modify application code, only test files
- Use optional chaining (`?.`) for all `blok` field accesses
- The site is built and served locally (webServer in playwright.config.ts)
- Content loads from Storyblok CDN at runtime (client-side SPA)
