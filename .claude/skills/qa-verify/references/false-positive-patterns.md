# False Positive Patterns

Known patterns where automated tools report bugs that aren't real. Check these before confirming any finding.

## Accessibility (axe-core)

### Contrast on CSS variables / relative color syntax
**What happens**: axe reports color-contrast failure but the actual rendered colors pass.
**Why**: axe can't resolve modern CSS like `color: oklch(...)`, `color-mix()`, or `var(--color)` with fallbacks.
**How to verify**: Use `filterFalseContrastViolations()` from `helpers/accessibility.ts` or check manually with browser DevTools color picker.

### Decorative images flagged for missing alt
**What happens**: axe flags `<img>` without alt text.
**Why**: Decorative images should have `alt=""` (empty, not missing). But `alt=""` is correct — the image is intentionally hidden from screen readers.
**How to verify**: Check if the image is inside a link/button with its own text label, or if it's purely decorative (background, spacer, icon with adjacent text).

### Hidden content heading violations
**What happens**: axe reports heading hierarchy issues on content inside `display:none` or `aria-hidden="true"`.
**Why**: Hidden content isn't perceivable by users and doesn't affect the heading outline.
**How to verify**: Check if the element or its ancestor has `display:none`, `visibility:hidden`, or `aria-hidden="true"`.

### Focus trap in modal
**What happens**: axe or manual keyboard check reports a focus trap.
**Why**: Modals are **supposed** to trap focus (WCAG requirement). The trap is intentional.
**How to verify**: Check if Escape closes the modal and returns focus to the trigger. If yes, it's correct behavior, not a trap.

### ARIA on custom components
**What happens**: axe flags missing or incorrect ARIA attributes.
**Why**: Custom components may use non-standard patterns that work for screen readers but don't match the ARIA spec exactly.
**How to verify**: Test with a screen reader (VoiceOver on Mac: Cmd+F5). If the component is operable and announced correctly, the ARIA pattern is acceptable even if non-standard.

## Links

### External 403/Forbidden
**What happens**: Link checker reports external link as broken (403).
**Why**: Many sites block automated HEAD/GET requests (LinkedIn, Instagram, Facebook, Twitter/X).
**How to verify**: Open the URL in a real browser. If it loads, the link is fine — the site is blocking bots.
**Common false-positive domains**: `linkedin.com`, `instagram.com`, `facebook.com`, `x.com`, `twitter.com`

### Redirect chains
**What happens**: Link checker reports a redirect chain (301 → 301 → 200).
**Why**: First redirect is often trailing slash normalization, second is locale redirect. Both are intentional.
**How to verify**: Follow the chain manually. If the final destination is the correct page, the chain is acceptable. Flag only if > 3 hops or the final destination is wrong.

### Anchor targets in lazy-loaded content
**What happens**: Link checker reports `#section-name` target doesn't exist.
**Why**: The target element may be lazy-loaded (below fold, in a tab, in an accordion).
**How to verify**: Scroll the full page or expand all content before checking anchors. Use `exposeHiddenContent()` from `helpers/accessibility.ts`.

## SEO

### Missing meta tags on staging
**What happens**: SEO audit reports missing `<meta>` tags or structured data.
**Why**: Some CMS platforms inject meta tags via edge workers or CDN config that only runs in production.
**How to verify**: Compare staging response with production: `curl -s https://production.com/page | grep '<meta'`. If production has the tags, it's staging-only.

### robots.txt blocking on staging
**What happens**: SEO audit reports `Disallow: /` in robots.txt.
**Why**: Staging environments intentionally block crawlers to prevent indexing.
**How to verify**: Check production robots.txt. If production allows crawling, this is expected staging behavior.

### Missing canonical on paginated pages
**What happens**: SEO audit flags missing or self-referential canonical on page 2+.
**Why**: Paginated pages may intentionally have `rel="next"/"prev"` instead of canonical, or canonical to page 1 is a valid strategy.
**How to verify**: Check if the pagination strategy is intentional. Self-referential canonical on each page is also acceptable per Google.

## Performance

### Slow metrics on staging
**What happens**: Perf audit reports LCP > 4s, high TBT, slow TTI.
**Why**: Staging servers are typically underpowered (shared hosting, no CDN, no caching, source maps served).
**How to verify**: Run the same test on production if possible, or mentally subtract: no CDN (+500ms), no cache (+300ms), source maps (+200ms). If adjusted numbers pass, it's infrastructure, not code.

### Large bundle including source maps
**What happens**: Perf audit reports JS bundle > 500KB.
**Why**: Staging often serves source maps inline or as separate files that inflate the total.
**How to verify**: Check if `.map` files are included in the count. Filter them out and re-measure.

### Third-party script impact
**What happens**: Perf audit flags large third-party scripts (analytics, ads, chat widgets).
**Why**: These may be test/staging versions that are larger than production, or may load differently behind a tag manager.
**How to verify**: Check if the same scripts load on production. Tag manager configs often differ between environments.

## Security Headers

### Missing CSP/HSTS on staging
**What happens**: Security audit reports missing Content-Security-Policy or Strict-Transport-Security.
**Why**: These headers are commonly added by the CDN, reverse proxy, or load balancer — not the application server.
**How to verify**: Check production headers: `curl -sI https://production.com/`. If production has them, the application doesn't need to set them.

### Cookie flags on third-party cookies
**What happens**: Security audit flags cookies without `Secure` or `HttpOnly`.
**Why**: Third-party cookies (analytics, consent, A/B testing) are set by external scripts and may not need these flags.
**How to verify**: Check if the cookie is first-party (your domain) or third-party. Only first-party session/auth cookies must have all flags.

## Visual Regression

### Font rendering differences
**What happens**: Visual diff shows text rendering changes with no code change.
**Why**: Font rendering varies by OS, GPU, and browser version. CI runners may render differently than local machines.
**How to verify**: Check if the diff is only in text antialiasing (subtle pixel differences in text areas). Increase `maxDiffPixelRatio` to 0.02 for text-heavy pages, or mask text regions.

### Dynamic content in screenshots
**What happens**: Visual diff shows changes in dates, counts, user-generated content.
**Why**: Screenshots captured at different times show different dynamic content.
**How to verify**: Use `mask` option in `toHaveScreenshot()` to exclude dynamic areas: `mask: [page.locator('.date'), page.locator('.count')]`

## General Rules

1. **Reproduce 3 times** before confirming. If it fails < 2/3, it's flaky, not confirmed.
2. **Check staging vs. production** for infrastructure-level findings (headers, performance, SEO).
3. **Check with a real browser** for link/rendering issues that automated tools may get wrong.
4. **Check the spec** before flagging ARIA patterns — some non-standard patterns are intentional.
5. **Check the intent** — a `Disallow` in robots.txt, a redirect chain, or a focus trap may be by design.
