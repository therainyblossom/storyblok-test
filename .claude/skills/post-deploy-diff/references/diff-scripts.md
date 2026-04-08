# Post-Deploy Diff — Scripts & Comparison Logic

## Baseline Capture Script

```typescript
import { PAGES, NAV } from '../fixtures/test-constants'

const pages = [
  { name: 'home', slug: PAGES.home.slug },
  { name: 'listing', slug: PAGES.listing.slug },
  { name: 'detail', slug: PAGES.detail.slug },
  { name: 'form', slug: PAGES.form.slug },
]

const baseline = []

for (const entry of pages) {
  const consoleErrors: string[] = []
  page.on('pageerror', (err) => consoleErrors.push(err.message))

  await page.goto(`/${entry.slug}`, { waitUntil: 'networkidle' })

  const state = await page.evaluate(() => ({
    url: window.location.href,
    title: document.title,
    h1: document.querySelector('h1')?.textContent?.trim() ?? null,
    bodyLength: document.body.innerText.length,
    linkCount: document.querySelectorAll('a[href]').length,
    imageCount: document.querySelectorAll('img').length,
    brokenImages: [...document.querySelectorAll('img')]
      .filter(img => img.complete && img.naturalWidth === 0).length,
    componentCount: document.querySelectorAll('[data-component]').length,
    navItems: [...document.querySelectorAll('nav a')]
      .map(a => a.textContent?.trim()).filter(Boolean),
  }))

  baseline.push({ ...entry, ...state, consoleErrors })
}

const fs = require('fs')
fs.writeFileSync(
  'e2e/test-results/deploy-baseline.json',
  JSON.stringify({ capturedAt: new Date().toISOString(), pages: baseline }, null, 2)
)
```

## Comparison Script

```typescript
const baseline = JSON.parse(
  fs.readFileSync('e2e/test-results/deploy-baseline.json', 'utf-8')
)

const diffs = []

for (const expected of baseline.pages) {
  await page.goto(`/${expected.slug}`, { waitUntil: 'networkidle' })

  const actual = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.textContent?.trim() ?? null,
    bodyLength: document.body.innerText.length,
    linkCount: document.querySelectorAll('a[href]').length,
    imageCount: document.querySelectorAll('img').length,
    brokenImages: [...document.querySelectorAll('img')]
      .filter(img => img.complete && img.naturalWidth === 0).length,
    componentCount: document.querySelectorAll('[data-component]').length,
    navItems: [...document.querySelectorAll('nav a')]
      .map(a => a.textContent?.trim()).filter(Boolean),
  }))

  const pageDiffs = compareStates(expected, actual)
  if (pageDiffs.length > 0) {
    diffs.push({ page: expected.name, slug: expected.slug, diffs: pageDiffs })
  }
}
```

## compareStates Function

```typescript
function compareStates(expected, actual) {
  const diffs = []

  if (actual.title !== expected.title)
    diffs.push({ prop: 'title', expected: expected.title, actual: actual.title, severity: 'critical' })

  if (actual.h1 !== expected.h1)
    diffs.push({ prop: 'h1', expected: expected.h1, actual: actual.h1, severity: 'critical' })

  const bodyRatio = actual.bodyLength / expected.bodyLength
  if (bodyRatio < 0.8 || bodyRatio > 1.2)
    diffs.push({ prop: 'bodyLength', expected: expected.bodyLength, actual: actual.bodyLength, severity: 'major' })

  if (Math.abs(actual.linkCount - expected.linkCount) > 5)
    diffs.push({ prop: 'linkCount', expected: expected.linkCount, actual: actual.linkCount, severity: 'major' })

  if (actual.brokenImages > expected.brokenImages)
    diffs.push({ prop: 'brokenImages', expected: expected.brokenImages, actual: actual.brokenImages, severity: 'critical' })

  if (actual.componentCount < expected.componentCount - 2)
    diffs.push({ prop: 'componentCount', expected: expected.componentCount, actual: actual.componentCount, severity: 'major' })

  const navChanged = JSON.stringify(actual.navItems) !== JSON.stringify(expected.navItems)
  if (navChanged)
    diffs.push({ prop: 'navItems', expected: expected.navItems, actual: actual.navItems, severity: 'critical' })

  return diffs
}
```

## Console Error Detection

```typescript
const newErrors: string[] = []
page.on('pageerror', (err) => newErrors.push(err.message))

await page.goto(`/${slug}`, { waitUntil: 'networkidle' })

const baselineErrors = new Set(expected.consoleErrors ?? [])
const unexpected = newErrors.filter(e => !baselineErrors.has(e))
```

## Comparison Tolerances

| Property | Tolerance | Diff if |
|----------|-----------|---------|
| Title | Exact | Changed (wrong branch? missing i18n?) |
| H1 | Exact | Changed or disappeared |
| Body length | ± 20% | Drastically shorter/longer |
| Link count | ± 5 | Significant change |
| Image count | ± 3 | Missing or unexpected |
| Broken images | 0 tolerance | Any new broken images |
| Component count | ± 2 | CMS blocks missing |
| Nav items | Exact order | Navigation changed |
| Console errors | 0 new | New JS errors |
