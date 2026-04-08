# Performance Budgets

Default budgets based on Google's Core Web Vitals thresholds and common best practices. **Customize these for your project** — a content-heavy marketing site has different needs than a lightweight app.

## Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2500ms | 2500-4000ms | > 4000ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |
| TBT (Total Blocking Time) | < 200ms | 200-600ms | > 600ms |
| TTI (Time to Interactive) | < 3800ms | 3800-7300ms | > 7300ms |

## Page Weight

| Resource | Budget | Notes |
|----------|--------|-------|
| Total page weight | < 2000KB | All resources combined |
| JavaScript (total) | < 300KB | Compressed/transferred size |
| CSS (total) | < 100KB | Compressed/transferred size |
| Images (total) | < 1000KB | Per page, not per image |
| Fonts (total) | < 200KB | Prefer system fonts or subset |
| Single JS bundle | < 200KB | Largest individual bundle |

## Request Count

| Metric | Budget | Notes |
|--------|--------|-------|
| Total requests | < 50 | All resource types |
| JavaScript files | < 15 | Indicates code splitting effectiveness |
| Third-party requests | < 10 | External domains |
| Image requests | < 20 | Per page |

## Image Optimization

| Check | Expectation |
|-------|-------------|
| Format | WebP or AVIF preferred over JPEG/PNG |
| Dimensions | `width` and `height` attributes set on all `<img>` |
| Lazy loading | Below-fold images have `loading="lazy"` |
| Sizing | No images loaded larger than their display size |

## Font Loading

| Check | Expectation |
|-------|-------------|
| font-display | `swap` or `optional` (never `block`) |
| Preload | Critical fonts use `<link rel="preload">` |
| Count | <= 4 font files total (variants included) |
| Subsetting | Only include needed character sets |

## Render-Blocking Resources

| Check | Expectation |
|-------|-------------|
| CSS in `<head>` | Critical CSS inlined or `<link media="print" onload>` |
| JS in `<head>` | All `<script>` have `defer` or `async` |
| Third-party scripts | Loaded with `async` or after page load |

## Adjusting Budgets

These defaults suit a typical marketing/content site. Adjust for your context:

- **Lightweight app**: Tighten JS to < 150KB, page weight to < 1000KB
- **Image-heavy site**: Raise images to < 2000KB, total to < 3000KB
- **Dashboard/SPA**: Raise JS to < 500KB, TTI to < 5000ms
- **E-commerce**: Keep strict LCP (< 2000ms) for product pages
