# Attack Patterns Quick Reference

Copy-paste probes for common bug categories.

## URL Injection
```javascript
const attacks = [
  '?param=<script>alert(1)</script>',
  '?param=',
  '?param=,,,',
  '?param=value,value',       // duplicate
  '?param=VALUE',             // wrong case
  '?param=value%20with%20spaces',
  '?a=1&a=2',                 // duplicate param names
  '?param=' + 'a'.repeat(1000), // overflow
]
```

## Rapid Interaction
```javascript
// Double-click submit
await button.dblclick()
// Rapid toggle
await openBtn.click(); await closeBtn.click(); await openBtn.click()
// Cascade chaos
await selectA('value1'); await selectB('value2'); await selectA('value3'); await submit()
```

## Browser Navigation
```javascript
// Filter → back → forward
await applyFilter()
const url = page.url()
await page.goBack()
await page.goForward()
console.log('Preserved:', page.url() === url)
```

## Viewport Resize During State
```javascript
await page.setViewportSize({ width: 1280, height: 800 })
await expandSomething()
await page.setViewportSize({ width: 375, height: 812 })
// Is layout broken?
```

## Stale State
```javascript
await page.goto('/page?filter=x')
await page.goto('/other-page')
await page.goto('/page')  // no params
// Is old filter still applied?
```

## Keyboard
```javascript
let tabCount = 0
while (tabCount < 50) {
  await page.keyboard.press('Tab')
  tabCount++
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim())
  if (focused?.includes('Target')) break
}
// Reachable in < 20 tabs?
```
