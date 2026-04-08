# Content Governance — Code Examples

Extraction scripts and test templates for each audit phase.

## Image Extraction

```typescript
const images = await page.evaluate(() => {
  return [...document.querySelectorAll('img')].map(img => {
    const rect = img.getBoundingClientRect()
    return {
      src: img.src,
      alt: img.alt,
      hasAlt: img.hasAttribute('alt'),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: Math.round(rect.width),
      displayHeight: Math.round(rect.height),
      loading: img.loading,
      complete: img.complete,
      hasWidthAttr: img.hasAttribute('width'),
      hasHeightAttr: img.hasAttribute('height'),
    }
  })
})
```

## Generic Alt Text Patterns

```typescript
const GENERIC_ALT = [
  /^image$/i,
  /^img$/i,
  /^photo$/i,
  /^picture$/i,
  /^untitled$/i,
  /^screenshot/i,
  /^DSC[_\d]/i,           // camera defaults: DSC_0001
  /^IMG[_\d]/i,           // phone defaults: IMG_20240315
  /^\d{4}[-_]\d{2}[-_]/,  // date-based: 2024-03-15_screenshot
  /\.(jpe?g|png|gif|webp|avif|svg)$/i, // filename as alt
]
```

## Text Overflow Detection

```typescript
const textIssues = await page.evaluate(() => {
  const issues: { selector: string; type: string; details: string }[] = []

  document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, span, li, td, th, button').forEach(el => {
    const style = getComputedStyle(el)
    if (style.overflow === 'hidden' || style.textOverflow === 'ellipsis') return

    if (el.scrollWidth > el.clientWidth + 2) {
      issues.push({
        selector: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ''),
        type: 'text-overflow',
        details: `Content overflows container: ${el.scrollWidth}px > ${el.clientWidth}px. Text: "${el.textContent?.trim().slice(0, 60)}"`,
      })
    }
  })

  document.querySelectorAll('[data-component] h2, [data-component] h3, .card h2, .card h3').forEach(el => {
    const text = el.textContent?.trim() ?? ''
    if (text.length > 100) {
      issues.push({
        selector: el.tagName.toLowerCase(),
        type: 'long-heading',
        details: `Heading is ${text.length} chars (>${100}): "${text.slice(0, 80)}..."`,
      })
    }
  })

  return issues
})
```

## Placeholder Text Patterns

```typescript
const PLACEHOLDER = [
  /lorem ipsum/i,
  /dolor sit amet/i,
  /\bTBD\b/,
  /\bTODO\b/,
  /\bplaceholder\b/i,
  /\bcoming soon\b/i,
  /\btest\s*(content|data|text)\b/i,
]
```

## Media & Embed Extraction

```typescript
const videos = await page.locator('video source, video[src]').evaluateAll(els =>
  els.map(el => ({ src: el.getAttribute('src'), type: el.getAttribute('type') }))
)

const iframes = await page.locator('iframe').evaluateAll(els =>
  els.map(el => ({ src: el.getAttribute('src'), title: el.getAttribute('title') }))
)
```

## CMS Component Scan

```typescript
const components = await page.evaluate(() => {
  return [...document.querySelectorAll('[data-component]')].map(el => {
    const name = el.getAttribute('data-component')
    const imgs = el.querySelectorAll('img')
    const links = el.querySelectorAll('a')
    const headings = el.querySelectorAll('h1,h2,h3,h4,h5,h6')

    return {
      component: name,
      hasImage: imgs.length > 0,
      hasLink: links.length > 0,
      hasHeading: headings.length > 0,
      emptyLinks: [...links].filter(a => !a.textContent?.trim() && !a.querySelector('img')).length,
      imgCount: imgs.length,
    }
  })
})
```

## Test Template

```typescript
import { test, expect } from '../fixtures/base'
import { PAGES } from '../fixtures/test-constants'

test.describe('Content quality', () => {
  test('no oversized images on listing page', async ({ page }) => {
    await page.goto(`/${PAGES.listing.slug}`, { waitUntil: 'networkidle' })

    const oversized = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter(img => img.naturalWidth > img.getBoundingClientRect().width * 2)
        .map(img => ({ src: img.src, natural: img.naturalWidth, display: Math.round(img.getBoundingClientRect().width) }))
    )

    expect(oversized, `Oversized images: ${JSON.stringify(oversized)}`).toHaveLength(0)
  })

  test('no generic alt text on listing page', async ({ page }) => {
    await page.goto(`/${PAGES.listing.slug}`, { waitUntil: 'networkidle' })

    const generic = await page.evaluate(() => {
      const BAD = [/^image$/i, /^img$/i, /^photo$/i, /^untitled$/i, /^screenshot/i, /\.(jpe?g|png|webp)$/i]
      return [...document.querySelectorAll('img[alt]')]
        .filter(img => BAD.some(p => p.test(img.alt)))
        .map(img => ({ src: img.src, alt: img.alt }))
    })

    expect(generic, `Generic alt text: ${JSON.stringify(generic)}`).toHaveLength(0)
  })
})
```
