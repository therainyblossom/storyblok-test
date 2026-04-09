---
name: e2e-test
description: Write Playwright e2e tests by analyzing code and requirements first, then targeting the highest-risk scenarios. No test code before understanding the feature.
disable-model-invocation: true
argument-hint: [feature-or-ticket-description]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(curl *) Read Write Edit Glob Grep Agent
---

# E2E Test Writer

Write expert-level Playwright e2e tests by analyzing code and requirements first, then targeting the most critical scenarios.

## Phase 0: Load Context (mandatory — do this FIRST)

Before any analysis or writing, read these files:

1. **Conventions**: Read [shared/conventions.md](../shared/conventions.md)
2. **Risk patterns**: Read [shared/risk-patterns.md](../shared/risk-patterns.md)
3. **Inferred requirements**: Read [references/inferred-requirements.md](references/inferred-requirements.md)
4. **Test constants**: Read `./e2e/fixtures/test-constants.ts`
5. **Existing tests**: Glob `./e2e/tests/*.spec.ts`
6. **Existing page objects**: Glob `./e2e/pages/*.ts`
7. **Helpers**: Glob `./e2e/helpers/*.ts`

Do NOT skip this. Do NOT write a single line of test code before all 7 are loaded.

## Phase 1: Understand the Feature

### 1a. Derive Requirements

Most features will NOT have a formal spec. Derive requirements from the code + the inferred requirements checklist in `references/inferred-requirements.md`.

Do NOT ask for a ticket. The code IS the spec.

If the user provides a ticket/spec, extract explicit criteria and fill gaps from the checklist.

### 1b. Read the Code

For every component involved, read:

| What | Where | Why |
|------|-------|-----|
| Component | `storyblok` | What renders, what's interactive |
| Schema/types | `storyblok` | Field definitions, validation |
| Business logic | `composables/` | State, API calls, computed values |
| Parent/page | `pages/` | How component is mounted |

Extract: state machine, transitions, data flow, conditional logic.

### 1c. Inspect the Live Page

Use Playwright to crawl the staging page:
- Actual DOM elements (not what code says — what renders)
- ARIA roles, data attributes, interactive elements
- Mobile vs desktop layout differences

## Phase 2: Risk Analysis

Score scenarios on likelihood x impact. Check against `references/risk-patterns.md`.

Output a test plan before writing code:

```markdown
## Test Plan: {Feature}
### Critical (must test)
1. {Scenario} — Risk: {why}
### Important (should test)
2. {Scenario} — Risk: {why}
### Nice to have
3. {Scenario}
```

Present to the user for confirmation.

## Phase 3: Write Tests

- Import `TEST_DATA` from `e2e/fixtures/test-constants.ts` — never hardcode CMS values
- Import `{ test, expect }` from `e2e/fixtures/base` to get `checkA11y` fixture
- Create page objects in `e2e/pages/` for complex features (extend `BasePage`)
- Use `checkA11y()` at the end of each test for accessibility
- Use helpers from `e2e/helpers/accessibility-patterns.ts` for keyboard/ARIA tests
- Group tests by priority: Critical, then Important
- Every test traces to a risk from Phase 2

## Phase 4: Verify

```bash
cd .
npx playwright test e2e/tests/{feature}.spec.ts --project=chromium
```

Classify each failure: test bug (fix) or real bug (keep failing test, document).

## Environment

- **Staging**: `https://therainyblossom.github.io/storyblok-test/`
- **Locales**: en, de
- **Test dir**: `./e2e/tests/`
- **Config**: `./playwright.config.ts`
