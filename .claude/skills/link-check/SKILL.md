---
name: link-check
description: Crawl pages and validate all links — find broken internal/external links, dead anchors, missing images, and insecure target="_blank" links.
disable-model-invocation: true
context: fork
argument-hint: [page-url-or-entry-point] [--external]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(curl *) Read Write Edit Glob Grep Agent
---

# Link Checker

Find broken links before users do.

## Phase 0: Load Context (mandatory)

1. Read `shared/conventions.md`
2. Read `{{FRONTEND_DIR}}/e2e/fixtures/test-constants.ts`
3. Glob `{{FRONTEND_DIR}}/e2e/tests/*-links.spec.ts`

Do NOT start the check before all files are loaded.

## Environment

- **Staging**: `{{STAGING_URL}}`
- **Test dir**: `{{FRONTEND_DIR}}/e2e/tests/`

## Phase 1: Collect Links

For each page, extract all links and resources:

```typescript
const links = await page.evaluate(() => {
  const base = window.location.origin

  const anchors = [...document.querySelectorAll('a[href]')].map(a => ({
    type: 'link' as const,
    href: a.getAttribute('href')!,
    text: a.textContent?.trim().slice(0, 80) ?? '',
    target: a.getAttribute('target'),
    rel: a.getAttribute('rel'),
    resolved: (a as HTMLAnchorElement).href,
  }))

  const images = [...document.querySelectorAll('img[src]')].map(img => ({
    type: 'image' as const,
    href: img.getAttribute('src')!,
    alt: img.getAttribute('alt'),
    resolved: (img as HTMLImageElement).src,
  }))

  return { anchors, images, base }
})
```

### Categorize

| Category | Pattern | Action |
|----------|---------|--------|
| Internal link | Same origin | HEAD request, expect 200 |
| External link | Different origin | HEAD request with 5s timeout, flag broken |
| Anchor link | Starts with `#` | Check target element exists on page |
| mailto/tel | Starts with `mailto:` or `tel:` | Validate format |
| JavaScript | `javascript:` | Flag as anti-pattern |
| Data URL | `data:` | Skip |

## Phase 2: Validate Links

### Internal Links
```bash
curl -sI -o /dev/null -w '%{http_code}' '{{STAGING_URL}}/path'
```
- **200**: Pass
- **301/302**: Warning — note redirect target, flag chains > 2 hops
- **404**: Fail — broken link
- **500**: Fail — server error

### External Links
```bash
curl -sI -o /dev/null -w '%{http_code}' --max-time 5 'https://external.com/path'
```
- **200**: Pass
- **403**: Warning — may be blocking bots (common for social media)
- **404/500**: Fail
- **Timeout**: Warning — may be slow, not broken

### Anchor Links
```typescript
const exists = await page.locator(`#${anchorId}`).count() > 0
```

### Security Check
Links with `target="_blank"` should have `rel="noopener"` (or `rel="noreferrer"`):
```typescript
const insecure = links.anchors.filter(
  a => a.target === '_blank' && !a.rel?.includes('noopener')
)
```

## Phase 3: Image Validation

- All `<img src>` return 200 (not 404)
- No empty `src` attributes
- No broken lazy-loaded images (scroll to trigger, then check)

## Phase 4: Write Tests

Save to `e2e/tests/{feature}-links.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'
import { PAGES } from '../fixtures/test-constants'

test.describe('Link validation', () => {
  test('homepage has no broken links', async ({ page }) => {
    await page.goto(`/${PAGES.home.slug}`, { waitUntil: 'networkidle' })

    const hrefs = await page.locator('a[href]').evaluateAll(
      els => els.map(a => (a as HTMLAnchorElement).href).filter(h => h.startsWith('http'))
    )

    for (const href of hrefs) {
      const response = await page.request.head(href, { timeout: 5000 }).catch(() => null)
      expect(response?.status(), `Broken link: ${href}`).toBeLessThan(400)
    }
  })
})
```

## Phase 5: Report

Score using [shared/verdict-scoring.md](../shared/verdict-scoring.md). Broken link (404/500) = Critical. Redirect chain >2 hops = Major. Missing rel="noopener" = Minor.

```markdown
# Link Check Report: {Feature/Site}

## Verdict: {PASS|CONCERNS|REWORK|FAIL} — Score: {n}/100

## Summary
- Pages checked: {n}
- Total links: {n} (internal: {n}, external: {n}, anchors: {n})
- Broken: {n} | Redirects: {n} | Warnings: {n}

## Broken Links (404/500)
| Source Page | Link Text | URL | Status |
|------------|-----------|-----|--------|
| /page-a | "Learn more" | /missing-page | 404 |

## Redirect Chains
| Source Page | URL | Chain | Final |
|------------|-----|-------|-------|
| /page-a | /old-path | /old → /new → /final | 3 hops |

## Broken Images
| Source Page | src | Status |
|------------|-----|--------|
| /page-a | /images/missing.jpg | 404 |

## Insecure target="_blank"
| Source Page | Link Text | URL | Missing |
|------------|-----------|-----|---------|
| /page-a | "External" | https://... | rel="noopener" |

## Anchor Links (missing targets)
| Source Page | Anchor | Target ID |
|------------|--------|-----------|
| /page-a | #section-3 | Not found |
```
