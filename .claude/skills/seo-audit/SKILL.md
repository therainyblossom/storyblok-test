---
name: seo-audit
description: Audit technical SEO — meta tags, Open Graph, structured data, canonical URLs, sitemap, robots.txt, and heading hierarchy.
disable-model-invocation: true
context: fork
argument-hint: [page-url-or-feature] [--all-pages]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(curl *) Read Write Edit Glob Grep Agent
---

# SEO Audit

Systematic check of on-page and site-level SEO signals.

## Phase 0: Load Context (mandatory)

1. Read [references/seo-checklist.md](references/seo-checklist.md)
2. Read `shared/conventions.md`
3. Read `{{FRONTEND_DIR}}/e2e/fixtures/test-constants.ts`
4. Glob `{{FRONTEND_DIR}}/e2e/tests/*-seo.spec.ts`

Do NOT start the audit before all files are loaded.

## Environment

- **Staging**: `{{STAGING_URL}}`
- **Locales**: {{LOCALE_LIST}}
- **Test dir**: `{{FRONTEND_DIR}}/e2e/tests/`

## Phase 1: Per-Page Checks

For each page (use test constants for URLs), run a Playwright script that extracts and validates:

```typescript
const meta = await page.evaluate(() => {
  const get = (sel: string) => document.querySelector(sel)?.getAttribute('content') ?? null
  const getAll = (sel: string) => [...document.querySelectorAll(sel)].map(el => ({
    tag: el.tagName.toLowerCase(),
    text: el.textContent?.trim() ?? '',
  }))
  return {
    title: document.title,
    description: get('meta[name="description"]'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    ogTitle: get('meta[property="og:title"]'),
    ogDescription: get('meta[property="og:description"]'),
    ogImage: get('meta[property="og:image"]'),
    ogUrl: get('meta[property="og:url"]'),
    twitterCard: get('meta[name="twitter:card"]'),
    twitterTitle: get('meta[name="twitter:title"]'),
    twitterDescription: get('meta[name="twitter:description"]'),
    jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent),
    hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(l => ({
      lang: l.getAttribute('hreflang'),
      href: l.getAttribute('href'),
    })),
    headings: getAll('h1, h2, h3, h4, h5, h6'),
    images: [...document.querySelectorAll('img')].map(img => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      width: img.getAttribute('width'),
      height: img.getAttribute('height'),
    })),
  }
})
```

### Validation Rules

| Check | Pass | Fail |
|-------|------|------|
| Title | 30-60 chars, unique per page | Missing, too short, too long, duplicate |
| Meta description | 120-160 chars, unique per page | Missing, too short, too long, duplicate |
| Canonical | Present, absolute URL, matches current page | Missing, relative, wrong page |
| OG tags | og:title, og:description, og:image all present | Any missing |
| Twitter card | twitter:card present | Missing |
| Headings | Exactly one h1, no skipped levels | Zero or multiple h1, skipped levels |
| Images | All `<img>` have alt text (or alt="" for decorative) | Missing alt attribute |
| Image dimensions | width + height set (prevents CLS) | Missing dimensions |
| JSON-LD | Valid JSON, has @type | Invalid JSON, missing @type |
| hreflang | Present for multi-locale sites, reciprocal | Missing, non-reciprocal |

## Phase 2: Site-Level Checks

### robots.txt
```bash
curl -sI '{{STAGING_URL}}/robots.txt'
curl -s '{{STAGING_URL}}/robots.txt'
```
- Should return 200
- Should not `Disallow: /` (blocks everything)
- Should reference sitemap

### sitemap.xml
```bash
curl -s '{{STAGING_URL}}/sitemap.xml' | head -50
```
- Should return 200 with valid XML
- Should contain tested page URLs
- URLs should be absolute

### HTTPS
- All pages should redirect HTTP → HTTPS
- No mixed content (HTTP resources on HTTPS pages)

## Phase 3: Cross-Page Validation

Collect titles and descriptions across all tested pages:
- Flag duplicates (same title on different pages)
- Flag missing translations (secondary locale has same title as default)

## Phase 4: Write Tests

Save to `e2e/tests/{feature}-seo.spec.ts`. Use the `checkA11y` fixture alongside SEO checks (heading hierarchy overlaps).

## Phase 5: Report

Score using [shared/verdict-scoring.md](../shared/verdict-scoring.md).

```markdown
# SEO Audit Report: {Feature/Site}

## Verdict: {PASS|CONCERNS|REWORK|FAIL} — Score: {n}/100

## Summary
- Critical: {n} | Major: {n} | Minor: {n} | Pass: {n}

## Per-Page Results
### {URL}
| Check | Status | Value | Issue |
|-------|--------|-------|-------|
| Title | PASS/FAIL | "..." | {reason} |
| ... | ... | ... | ... |

## Site-Level Results
| Check | Status | Issue |
|-------|--------|-------|
| robots.txt | PASS/FAIL | {reason} |
| sitemap.xml | PASS/FAIL | {reason} |
| HTTPS | PASS/FAIL | {reason} |

## Duplicate Content
| Check | Pages | Value |
|-------|-------|-------|
| Duplicate title | /page-a, /page-b | "Same Title" |
```
