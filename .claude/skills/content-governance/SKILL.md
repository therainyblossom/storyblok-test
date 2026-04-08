---
name: content-governance
description: Scan rendered pages for CMS content quality issues — oversized images, generic alt text, text overflows, missing required fields, and broken media.
disable-model-invocation: true
context: fork
argument-hint: [page-url-or-feature] [--all-pages]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(curl *) Read Write Edit Glob Grep Agent
---

# Content Governance

Find content quality issues that aren't bugs but degrade the user experience. These are editor mistakes, not code mistakes — the CMS allowed it, but the site shouldn't show it.

## Phase 0: Load Context (mandatory)

1. Read [references/content-rules.md](references/content-rules.md)
2. Read [references/code-examples.md](references/code-examples.md)
3. Read `shared/conventions.md`
4. Read `{{FRONTEND_DIR}}/e2e/fixtures/test-constants.ts`

Do NOT start the audit before all files are loaded.

## Environment

- **Staging**: `{{STAGING_URL}}`
- **Test dir**: `{{FRONTEND_DIR}}/e2e/tests/`

## Audit Phases

### Phase 1: Images
Use the image extraction script from `references/code-examples.md`. Check each image against the rules in `references/content-rules.md`:
- Oversized (natural > 2x display)
- Missing or generic alt text
- Broken (not loaded)
- Missing width/height attributes
- Not lazy-loaded below fold

### Phase 2: Text
Use the text overflow script from `references/code-examples.md`. Check:
- Text overflowing containers
- Headings > 100 chars in cards/components
- Placeholder text (Lorem ipsum, TBD, TODO)
- Empty visible containers

### Phase 3: Media
Use the media extraction script. Check:
- Videos without `poster`
- Iframes without `title`
- Broken embeds (404 or blocked)

### Phase 4: CMS Fields
Use the component scan script. Check:
- Components without headings
- Empty link text
- Image-only links without alt

### Phase 5: Write Tests
Save to `e2e/tests/{feature}-content.spec.ts`. See test template in `references/code-examples.md`.

### Phase 6: Report

Score using [shared/verdict-scoring.md](../shared/verdict-scoring.md). Broken/missing content = Critical. Oversized/overflow = Major. Generic alt, long heading = Minor.

```markdown
# Content Governance Report: {Feature/Site}

## Verdict: {PASS|CONCERNS|REWORK|FAIL} — Score: {n}/100

## Summary
| Category | Issues | Pages Affected |
|----------|--------|----------------|
| Images | {n} | {n} |
| Text | {n} | {n} |
| Media | {n} | {n} |
| CMS fields | {n} | {n} |

## Findings
| Page | Category | Issue | Details |
|------|----------|-------|---------|
| /page | Image | Oversized | 3000px natural, 400px display |
| /page | Image | Generic alt | "image" |
| /page | Text | Overflow | "This extremely long..." (142 chars) |

## Recommendations
{Actionable list for content editors, not developers}
```
