---
name: preflight
description: Pre-flight environment check before running tests — verify staging is up, correct version is deployed, auth works, and critical dependencies load.
disable-model-invocation: true
argument-hint: [--env staging|production] [--verbose]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(curl *) Read Write Edit Glob Grep Agent
---

# Pre-Flight Check

Verify the test environment is healthy before running the suite. Takes ~10 seconds. Run this first — every other skill assumes a working environment.

## Phase 0: Load Context (mandatory)

1. Read [references/preflight-checks.md](references/preflight-checks.md)
2. Read `./e2e/fixtures/test-constants.ts`

## Phase 1: Connectivity

Check that the staging URL responds:

```bash
# Should return 200 (or 401 if behind basic auth)
STATUS=$(curl -sI -o /dev/null -w '%{http_code}' --max-time 10 'https://therainyblossom.github.io/storyblok-test//')
echo "Status: $STATUS"
```

| Status | Verdict | Action |
|--------|---------|--------|
| 200 | Pass | Continue |
| 401 | Pass (auth required) | Continue with credentials |
| 000 | **FAIL** — DNS/network unreachable | Check VPN, DNS, firewall |
| 502/503 | **FAIL** — server down | Check deploy status, wait and retry |
| 404 | **FAIL** — wrong URL or not deployed | Verify STAGING_URL is correct |

## Phase 2: Authentication

If staging has basic auth, verify credentials work:

```bash
STATUS=$(curl -sI -o /dev/null -w '%{http_code}' --max-time 10 \
  -u ':' 'https://therainyblossom.github.io/storyblok-test//')
echo "Auth status: $STATUS"
```

| Result | Verdict |
|--------|---------|
| 200 | Pass — auth works |
| 401 | **FAIL** — wrong credentials |
| 200 without auth attempted | Pass — no auth needed (remove `httpCredentials` from config) |

## Phase 3: Page Renders

Verify pages actually render (not blank, no SSR errors):

```typescript
const { chromium } = require(require.resolve('@playwright/test', { paths: [process.cwd()] }))
;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    httpCredentials: { username: '', password: '' },
  })
  const page = await ctx.newPage()

  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('https://therainyblossom.github.io/storyblok-test//', { waitUntil: 'networkidle', timeout: 30000 })

  // Page should have content
  const bodyText = await page.locator('body').innerText()
  console.log('Body length:', bodyText.length, 'chars')
  console.log('Console errors:', errors.length)
  console.log('Title:', await page.title())

  // Check for SSR error pages
  const isErrorPage = bodyText.includes('Internal Server Error')
    || bodyText.includes('Application error')
    || bodyText.includes('500')
    || bodyText.length < 100

  console.log('Renders:', isErrorPage ? 'FAIL — error page or blank' : 'PASS')

  await browser.close()
})()
```

## Phase 4: Critical Dependencies

Check that key external resources load:

```typescript
const criticalResources: { name: string; loaded: boolean }[] = []

page.on('response', (res) => {
  const url = res.url()
  // Track CSS, JS, and font loading
  if (url.endsWith('.css') || url.endsWith('.js') || url.includes('fonts')) {
    criticalResources.push({
      name: url.split('/').pop() ?? url,
      loaded: res.status() === 200,
    })
  }
})

await page.goto('https://therainyblossom.github.io/storyblok-test//', { waitUntil: 'networkidle' })

const failed = criticalResources.filter(r => !r.loaded)
console.log('Resources:', criticalResources.length, 'loaded,', failed.length, 'failed')
```

Check for:
- CSS loads (page isn't unstyled)
- JS bundles load (interactivity works)
- Fonts load (text renders correctly)
- Cookie consent script loads (banners won't block tests)

## Phase 5: Cookie Consent

Verify the cookie banner appears and can be dismissed (many tests depend on this):

```typescript
import { dismissCookieConsent } from '../helpers/cookie-consent'

await page.goto('https://therainyblossom.github.io/storyblok-test//', { waitUntil: 'networkidle' })
await dismissCookieConsent(page)
// If this doesn't throw, consent handling works
console.log('Cookie consent: PASS')
```

## Phase 6: Report

```markdown
# Pre-Flight Report

| Check | Status | Details |
|-------|--------|---------|
| Connectivity | PASS/FAIL | HTTP {status} in {time}ms |
| Authentication | PASS/FAIL/N/A | {details} |
| Page renders | PASS/FAIL | {bodyLength} chars, {errorCount} console errors |
| Resources | PASS/FAIL | {loaded}/{total} loaded, {failed} failed |
| Cookie consent | PASS/FAIL | {details} |

## Verdict: {READY / NOT READY}

{If NOT READY: list what needs fixing before tests can run}
```

### Exit Codes

When running programmatically:
- **All pass** → proceed with test suite
- **Any fail** → stop, report the failure, don't waste CI time on a broken environment
