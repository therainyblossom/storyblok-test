---
name: test-data
description: Create deterministic CMS test fixtures so e2e tests never break when editors change content. Manages setup, teardown, and auditing.
disable-model-invocation: true
argument-hint: [setup|teardown|audit] [feature-name]
allowed-tools: Bash(curl *) Bash(cd * && npx playwright *) Bash(node *) Read Write Edit Glob Grep Agent
---

# Test Data & Fixtures

Isolate tests from CMS content changes.

## Two-Layer Approach

### Layer 1: Test Constants (lightweight)
A single `test-constants.ts` mapping all CMS-dependent values. When content changes, update ONE file.

```typescript
import { TEST_DATA } from '../fixtures/test-constants'
// Never: await page.goto('/path?highlight=hardcoded-slug')
// Always: await page.goto(`/${TEST_DATA.mainPage}?highlight=${TEST_DATA.knownItem.slug}`)
```

### Layer 2: Owned Fixtures (full isolation)
For tests needing guaranteed content, create stories via CMS API tagged `e2e-test-fixture`. Auto-cleanup in afterAll.

## Commands

### `/test-data setup`
Creates constants file, scans tests for hardcoded values, centralizes them.

### `/test-data teardown`
Deletes all CMS stories tagged `e2e-test-fixture`.

### `/test-data audit`
Validates all constants against staging. Run when tests fail for no obvious reason.

```bash
cd . && node path/to/audit-constants.js
```

## When to Use Which Layer

| Scenario | Layer |
|----------|-------|
| Test selects a dropdown option | Layer 1 — just needs a known value |
| Test verifies exact item count | Layer 2 — count must be deterministic |
| Visual regression test | Layer 1 + higher threshold |
| Test creates content and verifies it | Layer 2 — must own the content |
