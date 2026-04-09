# Layout Audit Checklist

## Test Template

Each check should use `page.evaluate()` with `getComputedStyle()` to verify actual CSS values, not class names.

### 1. Sticky Nav

```typescript
// Position
const position = await page.locator('nav').evaluate(el => getComputedStyle(el).position)
expect(position).toBe('sticky')

// Visible after scroll
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await expect(page.locator('nav')).toBeInViewport()

// Z-index
const z = await page.locator('nav').evaluate(el => parseInt(getComputedStyle(el).zIndex))
expect(z).toBeGreaterThanOrEqual(40)
```

### 2. No Horizontal Overflow

```typescript
const hasOverflow = await page.evaluate(() =>
  document.documentElement.scrollWidth > document.documentElement.clientWidth
)
expect(hasOverflow).toBe(false)
```

Test at both desktop and mobile viewports.

### 3. Content Below Nav

```typescript
const navBottom = await page.locator('nav').evaluate(el => el.getBoundingClientRect().bottom)
const contentTop = await page.locator('main').evaluate(el => el.getBoundingClientRect().top)
expect(contentTop).toBeGreaterThanOrEqual(navBottom - 1)
```

### 4. Footer Position

```typescript
const footerTop = await page.locator('footer').evaluate(el => el.getBoundingClientRect().top)
const viewportHeight = await page.evaluate(() => window.innerHeight)
expect(footerTop).toBeGreaterThan(viewportHeight) // Below fold on content pages
```

### 5. Max-Width Container

```typescript
const width = await page.locator('.max-w-screen-xl').first().evaluate(
  el => el.getBoundingClientRect().width
)
expect(width).toBeLessThanOrEqual(1280)
```

### 6. Mobile Stacking

```typescript
await page.setViewportSize({ width: 375, height: 812 })
// Grids should be single column
// Container should be <= viewport width
```

### 7. All Content Reachable

```typescript
const lastElement = page.locator('footer')
await lastElement.scrollIntoViewIfNeeded()
await expect(lastElement).toBeInViewport()
```

### 8. No Content Clipped

Look for `overflow: hidden` on containers that have interactive children:
```typescript
const clipped = await page.evaluate(() => {
  const containers = document.querySelectorAll('[style*="overflow: hidden"], .overflow-hidden')
  for (const c of containers) {
    if (c.querySelector('a, button, input, [tabindex]')) return true
  }
  return false
})
expect(clipped).toBe(false)
```

### 9. Z-Index Stacking

```typescript
const navZ = await page.locator('nav').evaluate(el => parseInt(getComputedStyle(el).zIndex) || 0)
const contentZ = await page.locator('main').evaluate(el => parseInt(getComputedStyle(el).zIndex) || 0)
expect(navZ).toBeGreaterThan(contentZ)
```

### 10. Responsive Images

```typescript
const overflowing = await page.evaluate(() => {
  const images = document.querySelectorAll('img')
  for (const img of images) {
    const parent = img.parentElement
    if (parent && img.offsetWidth > parent.offsetWidth + 1) return true
  }
  return false
})
expect(overflowing).toBe(false)
```

## Common Root Causes

| Bug | Cause | Fix |
|-----|-------|-----|
| Sticky not working | `overflow: hidden/auto` on parent | Move sticky element outside overflow container |
| Horizontal scroll | Image/element wider than viewport | Add `max-width: 100%` or `overflow-x: hidden` on body |
| Content behind nav | Missing margin/padding on first section | Add `pt-[nav-height]` to main content |
| Z-index not working | No `position` set (z-index needs positioned element) | Add `position: relative` |
| Mobile not stacking | Missing responsive breakpoints on grid | Use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
