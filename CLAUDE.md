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

## E2E Test Generation via @claude

Comment `@claude` on any PR to ask Claude to generate tests. Example:

> @claude generate e2e tests for the components changed in this PR

Claude will read the diff, use the e2e-test skill, and suggest test code.

When generating tests:
- Never modify application code, only test files
- Never modify smoke.spec.ts — that's the permanent baseline
- Use optional chaining (`?.`) for all `blok` field accesses
- Import from `e2e/fixtures/base`, not `@playwright/test`
- Use test constants from `e2e/fixtures/test-constants.ts`
