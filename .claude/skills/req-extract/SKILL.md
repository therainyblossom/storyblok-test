---
name: req-extract
description: Extract structured, testable requirements from Figma, PDFs, tickets, or code. Produces acceptance criteria, edge cases, and test stubs.
disable-model-invocation: true
argument-hint: [source: figma-url|pdf-path|feature-description]
allowed-tools: Bash(curl *) Bash(node *) Bash(pdftotext *) Read Write Edit Glob Grep Agent WebFetch
---

# Requirements Extraction

Extract structured, testable requirements from any source. A requirement that can't be tested isn't a requirement.

## Sources

- **Figma**: Extract visual states, breakpoints, interactions, spacing
- **PDF/Doc**: Extract with `pdftotext`, identify sections and user flows
- **Conversation**: Ask clarifying questions, identify implicit requirements
- **Code**: Reverse-engineer intended behavior, identify gaps

## Output Format

```markdown
# Requirements: {Feature}
**Source**: {Figma URL / PDF / ticket}

## User Stories
- As a {role}, I want to {action}, so that {benefit}

## Functional Requirements
### FR-001: {Title}
**Priority**: Must / Should / Could
**Acceptance Criteria**:
- [ ] Given {context}, when {action}, then {result}
**Edge Cases**: {empty, invalid, boundary}

## Non-Functional Requirements
- Responsive: 375px / 768px / 1280px behavior
- Accessibility: keyboard, ARIA, focus
- i18n: translatable fields, locale routing
- Performance: loading strategy

## Data Model
| Field | Type | Required | Translatable |
|-------|------|----------|-------------|

## State Machine
{All states and transitions}

## Test Stubs
{Playwright outline per FR}
```

See [references/editor-patterns.md](references/editor-patterns.md) for CMS-specific patterns.
See [examples/example-requirement.md](examples/example-requirement.md) for a complete example.
