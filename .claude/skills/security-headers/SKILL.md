---
name: security-headers
description: Audit HTTP security headers, cookie flags, HTTPS enforcement, and mixed content against OWASP recommendations.
disable-model-invocation: true
context: fork
argument-hint: [page-url-or-entry-point]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(curl *) Read Write Edit Glob Grep Agent
---

# Security Headers Audit

Check HTTP security headers and transport security against OWASP best practices.

## Phase 0: Load Context (mandatory)

1. Read [references/header-checklist.md](references/header-checklist.md)
2. Read `./e2e/fixtures/test-constants.ts`

Do NOT start the audit before all files are loaded.

## Environment

- **Staging**: `https://therainyblossom.github.io/storyblok-test/`
- **Test dir**: `./e2e/tests/`

## Phase 1: Response Headers

Fetch headers for each page and validate:

```bash
curl -sI 'https://therainyblossom.github.io/storyblok-test//path'
```

### Required Headers

| Header | Pass | Fail |
|--------|------|------|
| `Content-Security-Policy` | Present, no `unsafe-inline`/`unsafe-eval` in script-src, no wildcard `*` | Missing or wildcard policy |
| `Strict-Transport-Security` | Present, `max-age >= 31536000` | Missing or low max-age |
| `X-Content-Type-Options` | `nosniff` | Missing |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` | Missing or `ALLOWALL` |
| `Referrer-Policy` | Present, not `unsafe-url` | Missing or unsafe |
| `Permissions-Policy` | Present, restricts `camera`, `microphone`, `geolocation` | Missing |

### Headers That Should NOT Be Present

| Header | Why |
|--------|-----|
| `Server` | Reveals server software/version |
| `X-Powered-By` | Reveals framework/runtime |
| `X-AspNet-Version` | Reveals ASP.NET version |

## Phase 2: HTTPS Enforcement

```bash
# Should redirect to HTTPS (301)
curl -sI -o /dev/null -w '%{http_code} %{redirect_url}' 'http://https://therainyblossom.github.io/storyblok-test//path'
```

- HTTP request should 301 redirect to HTTPS equivalent
- No HTTP resources loaded on HTTPS pages (mixed content)

### Mixed Content Check

```typescript
const mixedContent: string[] = []

page.on('request', (req) => {
  if (page.url().startsWith('https://') && req.url().startsWith('http://')) {
    mixedContent.push(req.url())
  }
})

await page.goto(url, { waitUntil: 'networkidle' })
// mixedContent should be empty
```

## Phase 3: Cookie Security

```typescript
const cookies = await page.context().cookies()

for (const cookie of cookies) {
  // Session cookies should have:
  // - Secure flag (only sent over HTTPS)
  // - HttpOnly flag (not accessible to JavaScript)
  // - SameSite=Lax or Strict (CSRF protection)
  console.log({
    name: cookie.name,
    secure: cookie.secure,
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite,
    path: cookie.path,
    expires: cookie.expires,
  })
}
```

### Cookie Flags

| Flag | Pass | Fail |
|------|------|------|
| `Secure` | Set on all cookies when site uses HTTPS | Missing on any cookie |
| `HttpOnly` | Set on session/auth cookies | Missing on session cookies |
| `SameSite` | `Lax` or `Strict` | `None` without `Secure`, or missing |
| `Path` | Scoped to needed path | Set to `/` when not needed |

## Phase 4: Write Tests

Save to `e2e/tests/{feature}-security.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'
import { PAGES } from '../fixtures/test-constants'

test.describe('Security headers', () => {
  test('homepage has required security headers', async ({ request }) => {
    const response = await request.get(`/${PAGES.home.slug}`)
    const headers = response.headers()

    expect(headers['strict-transport-security']).toBeDefined()
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/i)
    expect(headers['referrer-policy']).toBeDefined()
    expect(headers['server']).toBeUndefined()
    expect(headers['x-powered-by']).toBeUndefined()
  })

  test('no mixed content on homepage', async ({ page }) => {
    const mixed: string[] = []
    page.on('request', (req) => {
      if (req.url().startsWith('http://') && !req.url().includes('localhost')) {
        mixed.push(req.url())
      }
    })
    await page.goto(`/${PAGES.home.slug}`, { waitUntil: 'networkidle' })
    expect(mixed, `Mixed content: ${mixed.join(', ')}`).toHaveLength(0)
  })

  test('cookies have security flags', async ({ page }) => {
    await page.goto(`/${PAGES.home.slug}`, { waitUntil: 'networkidle' })
    const cookies = await page.context().cookies()

    for (const cookie of cookies) {
      expect(cookie.secure, `${cookie.name} missing Secure`).toBe(true)
      expect(cookie.sameSite, `${cookie.name} SameSite`).toMatch(/Lax|Strict/i)
    }
  })
})
```

## Phase 5: Report

Score using [shared/verdict-scoring.md](../shared/verdict-scoring.md).

```markdown
# Security Headers Report: {Site}

## Verdict: {PASS|CONCERNS|REWORK|FAIL} — Score: {n}/100

## Summary
- Critical: {n} | Major: {n} | Minor: {n} | Pass: {n}

## Header Results
| Header | Status | Value | Expected |
|--------|--------|-------|----------|
| Content-Security-Policy | PASS/FAIL | {value} | Present, no wildcards |
| Strict-Transport-Security | PASS/FAIL | {value} | max-age >= 31536000 |
| X-Content-Type-Options | PASS/FAIL | {value} | nosniff |
| X-Frame-Options | PASS/FAIL | {value} | DENY or SAMEORIGIN |
| Referrer-Policy | PASS/FAIL | {value} | Not unsafe-url |
| Permissions-Policy | PASS/FAIL | {value} | Restricts sensitive APIs |
| Server | PASS/FAIL | {value} | Should not be present |
| X-Powered-By | PASS/FAIL | {value} | Should not be present |

## HTTPS
| Check | Status | Details |
|-------|--------|---------|
| HTTP → HTTPS redirect | PASS/FAIL | {redirect chain} |
| Mixed content | PASS/FAIL | {n} HTTP resources on HTTPS |

## Cookies
| Name | Secure | HttpOnly | SameSite | Issues |
|------|--------|----------|----------|--------|
| {name} | Yes/No | Yes/No | {value} | {issues} |
```
