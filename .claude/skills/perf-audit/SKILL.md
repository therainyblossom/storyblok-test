---
name: perf-audit
description: Audit page performance — Core Web Vitals, resource loading, image optimization, and bundle size against configurable budgets.
disable-model-invocation: true
context: fork
argument-hint: [page-url-or-feature] [--mobile]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(curl *) Read Write Edit Glob Grep Agent
---

# Performance Audit

Measure page performance and compare against budgets.

## Phase 0: Load Context (mandatory)

1. Read [references/perf-budgets.md](references/perf-budgets.md)
2. Read `shared/conventions.md`
3. Read `./e2e/fixtures/test-constants.ts`
4. Glob `./e2e/tests/*-perf.spec.ts`

Do NOT start the audit before all files are loaded.

## Environment

- **Staging**: `https://therainyblossom.github.io/storyblok-test/`
- **Test dir**: `./e2e/tests/`

## Phase 1: Core Web Vitals

Use Playwright's Performance API to measure vitals. Run with `--project=chromium` and network throttling for realistic results.

```typescript
// Measure LCP, CLS, TBT in a Playwright test
const metrics = await page.evaluate(() => {
  return new Promise<{ lcp: number; cls: number; tbt: number; tti: number }>((resolve) => {
    let lcp = 0, cls = 0, tbt = 0

    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      lcp = entries[entries.length - 1]?.startTime ?? 0
    }).observe({ type: 'largest-contentful-paint', buffered: true })

    // CLS
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) cls += (entry as any).value
      }
    }).observe({ type: 'layout-shift', buffered: true })

    // TBT (long tasks > 50ms)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        tbt += Math.max(0, entry.duration - 50)
      }
    }).observe({ type: 'longtask', buffered: true })

    // Collect after page settles
    setTimeout(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      resolve({
        lcp,
        cls: Math.round(cls * 1000) / 1000,
        tbt,
        tti: nav?.domInteractive ?? 0,
      })
    }, 5000)
  })
})
```

## Phase 2: Resource Analysis

Intercept network requests to measure page weight and request count:

```typescript
const resources: { url: string; type: string; size: number }[] = []

page.on('response', async (response) => {
  const headers = response.headers()
  const size = parseInt(headers['content-length'] || '0', 10)
  const type = headers['content-type']?.split(';')[0] ?? 'unknown'
  resources.push({ url: response.url(), type, size })
})

await page.goto(url, { waitUntil: 'networkidle' })
```

### What to check

| Check | How |
|-------|-----|
| Total page weight | Sum all response sizes |
| Request count | Count all requests |
| JS bundle size | Filter `application/javascript`, find largest |
| Render-blocking resources | Check `<link>` without `media` or `async`, `<script>` without `defer`/`async` |
| Third-party scripts | Requests to domains != staging domain |
| Image formats | Check for JPEG/PNG where WebP/AVIF would be smaller |
| Lazy loading | Below-fold `<img>` should have `loading="lazy"` |
| Image dimensions | All `<img>` should have `width` and `height` (prevents CLS) |
| Font loading | Check for `font-display: swap` in stylesheets, `<link rel="preload">` for fonts |

## Phase 3: Compare Against Budgets

Compare measured values against the budgets in `references/perf-budgets.md`. Classify each as:
- **Pass** — within budget
- **Warning** — within 20% over budget
- **Fail** — over budget

## Phase 4: Write Tests

Save to `e2e/tests/{feature}-perf.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'
import { PAGES } from '../fixtures/test-constants'

test.describe('Performance', () => {
  test('homepage loads within budget', async ({ page }) => {
    const resources: { size: number }[] = []
    page.on('response', async (res) => {
      const size = parseInt(res.headers()['content-length'] || '0', 10)
      resources.push({ size })
    })
    await page.goto(`/${PAGES.home.slug}`, { waitUntil: 'networkidle' })

    const totalBytes = resources.reduce((s, r) => s + r.size, 0)
    expect(totalBytes).toBeLessThan(2 * 1024 * 1024) // 2MB budget

    expect(resources.length).toBeLessThan(50) // request count budget
  })
})
```

## Phase 5: Report

Score using [shared/verdict-scoring.md](../shared/verdict-scoring.md). FAIL on LCP/CLS/TBT = Critical. FAIL on other budgets = Major. Warning (within 20%) = Minor.

```markdown
# Performance Report: {Feature/Site}

## Verdict: {PASS|CONCERNS|REWORK|FAIL} — Score: {n}/100

## Summary
| Metric | Value | Budget | Status |
|--------|-------|--------|--------|
| LCP | {n}ms | <2500ms | PASS/FAIL |
| CLS | {n} | <0.1 | PASS/FAIL |
| TBT | {n}ms | <200ms | PASS/FAIL |
| Page weight | {n}KB | <2000KB | PASS/FAIL |
| Requests | {n} | <50 | PASS/FAIL |
| JS bundle | {n}KB | <300KB | PASS/FAIL |

## Resource Breakdown
| Type | Count | Size | % of Total |
|------|-------|------|------------|
| JavaScript | {n} | {n}KB | {n}% |
| CSS | {n} | {n}KB | {n}% |
| Images | {n} | {n}KB | {n}% |
| Fonts | {n} | {n}KB | {n}% |
| Other | {n} | {n}KB | {n}% |

## Issues
### {ID} {Title}
- Impact: {Critical/Major/Minor}
- Details: ...
- Fix: ...
```
