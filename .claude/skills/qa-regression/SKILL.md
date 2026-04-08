---
name: qa-regression
description: Run the Playwright regression suite, classify failures, and triage flaky tests. Reports suite health before merge or deploy.
disable-model-invocation: true
argument-hint: [scope: all|feature-name] [--fix-flaky]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(git *) Read Write Edit Glob Grep Agent
---

# QA Regression — Test Suite Manager

Run, analyze, and maintain the Playwright regression suite.

## Phase 0: Load Context (mandatory)

1. Read [references/flaky-patterns.md](references/flaky-patterns.md)
2. Read `shared/conventions.md`
3. Read `{{FRONTEND_DIR}}/e2e/fixtures/test-constants.ts`
4. Glob `{{FRONTEND_DIR}}/e2e/tests/*.spec.ts`

## Workflow

### 1. Run the Suite
```bash
cd {{FRONTEND_DIR}}
npx playwright test --project=chromium
```

### 2. Classify Every Failure

| Category | Action |
|----------|--------|
| **Known bug** | Note it, move on |
| **New regression** | Investigate immediately |
| **Flaky** | Fix the test |
| **Environment** | Staging down, content changed |
| **Stale test** | Feature changed, update test |

### 3. Investigate Regressions
- Read error + screenshot
- Check `git log --oneline -20`
- Read the component source
- Determine root cause

### 4. Fix Flaky Tests (if --fix-flaky)

See [references/flaky-patterns.md](references/flaky-patterns.md) for the full list. Most common fixes:

| Pattern | Fix |
|---------|-----|
| Assert before API response | Use `waitForApi()` from `helpers/network.ts` |
| `waitForTimeout(N)` | Replace with `waitForDomStable()` or `waitForSelector()` |
| Element not found | Add `waitFor({ state: 'visible' })` |
| Click during animation | Wait for animations to finish or disable them |
| Cookie banner blocking | Ensure `dismissCookieBanner()` runs in `beforeEach` |
| Navigation race | Use `waitForURL()` or `BasePage.waitForNavigation()` |

### 5. Report

Score using [shared/verdict-scoring.md](../shared/verdict-scoring.md). New regression = Critical. Flaky test = Major. Stale test = Minor.

```markdown
# Regression Report

## Verdict: {PASS|CONCERNS|REWORK|FAIL} — Score: {n}/100

| Status | Count |
|--------|-------|
| Passed | {n} |
| Failed (known) | {n} |
| Failed (new) | {n} |
| Flaky | {n} |
| Skipped | {n} |

## Recommendation: {ship / hold / fix first}
```
