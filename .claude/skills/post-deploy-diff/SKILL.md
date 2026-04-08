---
name: post-deploy-diff
description: Compare the live site after deploy against the last known-good state — catch wrong branch, missing env vars, broken build, and content regressions in 30 seconds.
disable-model-invocation: true
argument-hint: [--baseline capture|--check] [page-url]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(curl *) Read Write Edit Glob Grep Agent
---

# Post-Deploy Diff

Fast equivalence check after deploy. Not a full test suite — a 30-second "did we break the deploy?" sanity check.

**Different from smoke test**: smoke tests *functionality* (can users do things?). Post-deploy diff tests *equivalence* (is the site the same as before, minus intentional changes?).

## Commands

### `/post-deploy-diff --baseline capture`
Capture the current state as the known-good baseline. Run after a successful deploy that passes all tests.

### `/post-deploy-diff --check`
Compare current state against the baseline. Run immediately after every deploy.

## Phase 0: Load Context (mandatory)

1. Read [references/diff-scripts.md](references/diff-scripts.md)
2. Read `{{FRONTEND_DIR}}/e2e/fixtures/test-constants.ts`
3. Read `{{FRONTEND_DIR}}/e2e/test-results/deploy-baseline.json` (if it exists)

## Phase 1: Capture Baseline
Use the baseline capture script from `references/diff-scripts.md`. Visits each key page from test constants and records: title, h1, body length, link/image/component counts, nav items, console errors. Saves to `e2e/test-results/deploy-baseline.json`.

## Phase 2: Check Against Baseline
Use the comparison script and `compareStates` function from `references/diff-scripts.md`. See tolerances table there for thresholds per property.

## Phase 3: New Console Errors
Use the console error detection script. Filters out errors that existed in the baseline.

## Phase 4: Report

```markdown
# Post-Deploy Diff Report

**Baseline**: {capturedAt}  |  **Checked**: {now}  |  **Verdict**: {CLEAN / DIFFS FOUND}

## Page Results
| Page | Status | Diffs |
|------|--------|-------|
| home | CLEAN / CHANGED | {n} differences |

## Differences Found
| Page | Property | Baseline | Current | Severity |
|------|----------|----------|---------|----------|
| home | title | "Welcome" | "Error" | Critical |

## New Console Errors
| Page | Error |
|------|-------|
| /home | ReferenceError: config is not defined |
```

## When to Update the Baseline
- After a deploy that passes all tests
- After intentional content/navigation changes
- **Never** after a failed deploy
