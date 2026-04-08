---
name: req-validate
description: Validate that a feature matches its spec by comparing code, CMS schema, and live staging behavior against requirements. Produces a verdict report.
disable-model-invocation: true
argument-hint: [requirements-file-or-feature] [component-or-url]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(curl *) Read Write Edit Glob Grep Agent
---

# Requirements Validation

Verify implementation matches specification.

## Process

### 1. Load Requirements
Find the spec: requirements file, ticket, CMS schema, or reverse-engineer from code.

### 2. Load Implementation
Read: component source, schema, composables/hooks, live staging behavior.

### 3. Compare — Requirement by Requirement

| Verdict | Meaning |
|---------|---------|
| **PASS** | Matches exactly |
| **FAIL** | Contradicts requirement |
| **PARTIAL** | Some criteria pass, others fail |
| **NOT IMPLEMENTED** | Doesn't exist yet |
| **DRIFT** | Works but diverged from spec |
| **AMBIGUOUS** | Requirement unclear |

### 4. Verify Live
Run Playwright against staging for testable requirements.

### 5. Check Non-Functional
Always check even if not in spec:
- Responsive (375px, 768px, 1280px)
- i18n (default + secondary locale)
- Keyboard navigation
- Heading hierarchy

### 6. Report

```markdown
# Validation Report: {Feature}
| Verdict | Count |
|---------|-------|
| PASS | {n} |
| FAIL | {n} |
| PARTIAL | {n} |

## Results
### FR-001: {Title} — {VERDICT}
**Spec**: {what it should do}
**Actual**: {what it does}
**Evidence**: {test result or code reference}
```
