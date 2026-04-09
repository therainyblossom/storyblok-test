---
name: smoke-test
description: Write or run a fast (<2 min) critical-path smoke test — the go/no-go gate after every deploy before the full suite runs.
disable-model-invocation: true
argument-hint: [write|run] [--update]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(curl *) Read Write Edit Glob Grep Agent
---

# Smoke Test

A fast, curated subset of critical-path tests. Answers one question: **is the site working?**

Run after every deploy. If smoke fails, don't run the full suite — fix the deploy first.

## Phase 0: Load Context (mandatory)

1. Read [references/smoke-template.md](references/smoke-template.md)
2. Read `shared/conventions.md`
3. Read `./e2e/fixtures/test-constants.ts`
4. Read `./e2e/tests/smoke.spec.ts` (if it exists)

## Commands

### `/smoke-test write`
Create or update `e2e/tests/smoke.spec.ts` using the template from `references/smoke-template.md`. Customize selectors for the project.

### `/smoke-test run`
```bash
cd . && npx playwright test e2e/tests/smoke.spec.ts --project=chromium --retries=0
```

### `/smoke-test --update`
Review existing smoke test, check if it still covers the critical path, update for new pages or features.

## Critical Path (5 areas)

Pick **one test per area** — the fastest, most representative assertion:

1. **Homepage loads** — h1 visible, nav visible, footer visible, checkA11y
2. **Navigation works** — click first nav item, verify inner page loads
3. **Listing renders** — content items visible on listing page
4. **Detail renders** — specific page loads with expected h1
5. **Interactive feature** — form field is fillable (proves JS executes)

See `references/smoke-template.md` for complete code examples.

## Rules

1. **<2 minutes total** — if smoke is slow, it won't be run
2. **Zero flakes** — no retries, no `waitForTimeout`. If it flakes, replace it.
3. **One assertion per area** — edge cases are the full suite's job
4. **Use test constants** — never hardcode URLs or content
5. **Fix immediately** — a failing smoke test means the deploy is broken

## When to Update

- A new critical page type is added
- Navigation structure changes
- A form or interactive feature is added/removed
- A smoke test starts flaking (replace it, don't add retries)
