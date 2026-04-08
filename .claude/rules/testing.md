# Testing Rules

These rules are enforced on every test file in the project. Violations should be caught during code review or by hooks.

## Imports

- Always import `{ test, expect }` from `../fixtures/base`, never from `@playwright/test` directly
- Always import page data from `../fixtures/test-constants`, never hardcode URLs or content strings
- Use helpers from `../helpers/` for common patterns (network, i18n, accessibility)

## Test Design

- Test behavior, not implementation — tests should survive refactoring
- Each test checks one thing — split multi-concern tests into separate cases
- Tests are independent — no shared mutable state, no execution order dependency
- Use descriptive names: `'displays filtered results after category selection'` not `'test filter'`

## Selectors

- Priority: `getByRole()` > `[data-component]` > `[data-testid]` > semantic HTML
- Never use CSS class names, XPath, or generated selectors
- Never use `nth-child` or index-based selectors (brittle)

## Waiting

- Use `{ waitUntil: 'networkidle' }` for navigation
- Use `waitForApi()` when asserting after data loads
- Use `waitForDomStable()` when asserting after dynamic DOM changes
- Never use `waitForTimeout()` — always wait for a specific condition

## Assertions

- Assert structure (visible, count, exists), not exact text content
- Use `>=` for counts, never `===` (content may grow)
- Use `toContainText()` for partial matching, never `toHaveText()` for CMS content

## Accessibility

- Call `checkA11y()` at the end of every test
- Use `{ prepare: true }` to open `<details>` before scanning
- Use `{ filterContrast: true }` if the project uses CSS relative color syntax

## Page Objects

- Use Page Object Model for features with complex interactions
- Extend `BasePage` — don't create standalone classes
- Keep selectors and interactions in page objects, not in test files
- One page object per feature/component, not per page URL

## Test Data

- All CMS-dependent values live in `test-constants.ts`
- Never hardcode slugs, titles, filter values, or locale paths
- Use `LOCALES`, `PAGES`, `FILTERS`, `BREAKPOINTS` exports

## What NOT to Do

- Don't skip tests on main branch (`test.skip` only in feature branches)
- Don't add retries to individual tests — fix the flake instead
- Don't test private/internal implementation details
- Don't duplicate test logic — parameterize with `for` loops or test.describe
- Don't commit `.only` — the CI hook blocks it via `forbidOnly`
