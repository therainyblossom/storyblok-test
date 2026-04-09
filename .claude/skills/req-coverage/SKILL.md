---
name: req-coverage
description: Map requirements to tests and components to find coverage gaps. Identifies untested components, unverified requirements, and missing specs.
disable-model-invocation: true
argument-hint: [feature-name|all]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Read Write Edit Glob Grep Agent
---

# Requirements Coverage & Traceability

Find gaps: requirements without tests, tests without requirements, components without specs.

## Process

### 1. Inventory
- Components: `ls storyblok`
- Tests: `ls ./e2e/tests/*.spec.ts`
- Requirements: scan for spec files, acceptance criteria in tests

### 2. Build Matrix

| Component | Schema | Implementation | Requirements | Tests | Coverage |
|-----------|--------|----------------|--------------|-------|----------|
| {name} | Yes/No | Yes/No | Full/Partial/None | {count} | {%} |

### 3. Identify Gaps

- **Untested**: components with 0 tests
- **Unverified**: requirements without matching tests
- **Orphaned**: tests that don't trace to requirements
- **Untested states**: default, empty, error, mobile, secondary locale, keyboard

### 4. Prioritize by Risk

| Factor | Weight |
|--------|--------|
| User-facing | High |
| Data integrity | Critical |
| SEO impact | Medium |
| Editor-facing | Medium |
| Dev-only | Low |

### 5. Report

```markdown
# Coverage Report
| Metric | Value |
|--------|-------|
| Components | {n} |
| With tests | {n} ({%}) |
| Requirements | {n} |
| Verified | {n} ({%}) |

## Critical Gaps
1. {Component} — {n} features, 0 tests — Risk: {why}

## Recommended Next Tests
1. /e2e-test {feature} — covers {n} requirements
```

## Quick Snapshot

```bash
cd .
echo "Components: $(ls storyblok/*.vue 2>/dev/null | wc -l)"
echo "Test files: $(ls e2e/tests/*.spec.ts 2>/dev/null | wc -l)"
echo "Tests: $(npx playwright test --list --project=chromium 2>&1 | grep -c 'test')"
```
