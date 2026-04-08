---
name: qa-audit
description: Run a structured QA audit on a page or feature. Systematically checks functional logic, links, responsive layout, i18n, a11y, and edge cases.
disable-model-invocation: true
argument-hint: [feature-or-page-url] [focus-area]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(curl *) Read Write Edit Glob Grep Agent
---

# QA Audit

Structured, multi-pass QA audit. Catches bugs a developer would miss.

## Phase 0: Load Context (mandatory — do this FIRST)

1. Read [references/known-patterns.md](references/known-patterns.md)
2. Read `shared/risk-patterns.md`
3. Read `shared/conventions.md`
4. Read `{{FRONTEND_DIR}}/e2e/fixtures/test-constants.ts`
5. Glob `{{FRONTEND_DIR}}/e2e/tests/*.spec.ts`

Do NOT start the audit before all files are loaded.

## Environment

- **Staging**: `{{STAGING_URL}}`
- **Test dir**: `{{FRONTEND_DIR}}/e2e/tests/`

## Audit Process

### Phase 1: Reconnaissance
Read the source code. Crawl the live page. Map the state machine.

### Phase 2: Systematic Checks

Classify each finding: P0 Critical / P1 Major / P2 Minor / P3 Cosmetic.

1. **Functional Logic** — actions produce expected results, filters combine correctly, URL params sync
2. **Link & Navigation** — all `<a>` tags valid, no dead links, external links open new tab
3. **Responsive** — test at 375px, 768px, 1280px using `BasePage.testAtBreakpoint(width, height, fn)` (overflow, touch targets, scaling)
4. **i18n** — test default + secondary locale (translations, layout, routing)
5. **Edge Cases** — empty state, invalid input, rapid clicking, back button, single result
6. **Accessibility** — run `checkA11y()` fixture, then use helpers from `e2e/helpers/accessibility-patterns.ts`:
   - `testModalFocusTrap(page, modal, trigger)` for dialogs
   - `testTabNavigation(page, container)` for tab widgets
   - `testDropdownKeyboard(page, trigger)` for dropdowns
   - `assertHeadingHierarchy(page)` for heading levels
7. **Semantic HTML** — correct tags, heading levels via `assertHeadingHierarchy(page)`, landmarks

### Phase 3: Write Failing Tests
One test per bug in `e2e/tests/{feature}-audit.spec.ts`.

### Phase 4: Report

Score using [shared/verdict-scoring.md](../shared/verdict-scoring.md). Map P0→Critical, P1→Major, P2→Minor, P3→Info.

```markdown
# QA Audit Report: {Feature}

## Verdict: {PASS|CONCERNS|REWORK|FAIL} — Score: {n}/100

| Severity | Count | Weight | Demerits |
|----------|-------|--------|----------|
| P0 Critical | {n} | ×10 | {n} |
| P1 Major | {n} | ×5 | {n} |
| P2 Minor | {n} | ×2 | {n} |

## Findings
### {BUG-001} {Title}
- Severity: P0/P1/P2/P3
- Steps: ...
- Expected: ...
- Actual: ...
- Test: `e2e/tests/{file}:{line}`
```
