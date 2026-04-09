---
name: qa-a11y
description: Run a WCAG 2.1 AA accessibility audit combining axe-core scans with manual Playwright checks for keyboard nav, focus, and ARIA semantics.
disable-model-invocation: true
argument-hint: [page-url-or-feature]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Read Write Edit Glob Grep Agent
---

# Accessibility Audit — WCAG 2.1 AA

Combines automated axe-core scans with manual Playwright-driven checks.

## Prerequisites

```bash
cd . && npm install -D @axe-core/playwright
```

## Available Helpers

The toolkit provides reusable helpers in `e2e/helpers/`. Use these instead of writing inline axe-core or keyboard checks:

```typescript
// Automated axe-core scan via fixture (preferred)
import { test, expect } from '../fixtures/base'
test('page is accessible', async ({ page, checkA11y }) => {
  await page.goto('/my-page')
  await checkA11y() // critical/serious → fail, moderate/minor → warn
  await checkA11y({ exclude: ['.third-party-widget'] }) // exclude selectors
  await checkA11y({ warnOnly: true }) // log all, never fail
})

// Keyboard & ARIA pattern helpers (standalone functions)
import { testModalFocusTrap, testTabNavigation, testDropdownKeyboard, assertHeadingHierarchy } from '../helpers/accessibility-patterns'
await testModalFocusTrap(page, '[role="dialog"]', '#open-modal-btn')
await testTabNavigation(page, '.tabs-container')
await testDropdownKeyboard(page, '#language-selector')
await assertHeadingHierarchy(page)
```

## Audit Process

### 1. Automated Scan
Use the `checkA11y` fixture from `fixtures/base.ts`. It wraps axe-core with WCAG 2.1 AA tags and severity filtering:
- **Critical/serious** violations fail the test
- **Moderate/minor** violations log warnings

For advanced options, import `checkAccessibility` directly from `helpers/accessibility.ts`.

### 2. Keyboard Navigation
Use the helpers from `helpers/accessibility-patterns.ts` to test keyboard interaction patterns:

| Widget | Helper | Verifies |
|--------|--------|----------|
| Tabs | `testTabNavigation(page, container)` | Arrow keys move between tabs, Tab leaves tablist |
| Dropdown | `testDropdownKeyboard(page, trigger)` | Arrow keys navigate, Enter selects, Escape closes |
| Modal | `testModalFocusTrap(page, modal, trigger?)` | Tab cycles inside, Escape closes, focus returns |
| Accordion | Manual check | Enter/Space toggles `aria-expanded` |

For patterns not covered by helpers, test manually:
- Tab through all interactive elements — is focus order logical?
- Any keyboard traps?

### 3. Semantic Structure
Use `assertHeadingHierarchy(page)` to verify heading levels, then check manually:
- Landmarks: header, nav, main, footer
- Images have alt text
- Form inputs have labels

### 4. Visual
- Text contrast ≥ 4.5:1
- Focus indicators visible
- Animations respect `prefers-reduced-motion`

### 5. Write Tests
Save to `e2e/tests/{feature}-a11y.spec.ts`.

### 6. Report

Score using [shared/verdict-scoring.md](../shared/verdict-scoring.md). Map Critical→Critical, Serious→Major, Moderate→Minor.

```markdown
# A11y Report: {Feature}

## Verdict: {PASS|CONCERNS|REWORK|FAIL} — Score: {n}/100

| Category | Critical | Serious | Moderate | Minor |
|----------|----------|---------|----------|-------|
| axe-core | {n} | {n} | {n} | {n} |
| Keyboard | {n} | {n} | {n} | {n} |
| Semantic | {n} | {n} | {n} | {n} |
| Visual   | {n} | {n} | {n} | {n} |
```
