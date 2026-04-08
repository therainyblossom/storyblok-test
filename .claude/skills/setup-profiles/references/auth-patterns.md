# Authentication Patterns

How to handle different auth methods when creating Playwright profiles.

## Form Login (Username + Password)

The most common pattern. Fill the form, submit, wait for redirect.

```typescript
await page.goto('/login')
await page.getByLabel('Email').fill(email)
await page.getByLabel('Password').fill(password)
await page.getByRole('button', { name: /sign in|log in/i }).click()
await page.waitForURL('**/dashboard**')
await page.context().storageState({ path: profilePath })
```

**Common gotchas:**
- Some forms use `name` instead of `email` as the first field
- "Remember me" checkbox may affect session duration
- CAPTCHA on login — use test accounts that bypass it, or add CAPTCHA skip for staging

## OAuth / SSO (Google, GitHub, Microsoft, Keycloak)

OAuth flows involve redirects to an external provider and back. The storageState captures the final session.

```typescript
await page.goto('/login')
await page.getByRole('button', { name: 'Sign in with Google' }).click()

// Google OAuth form (may vary)
await page.getByLabel('Email or phone').fill(email)
await page.getByRole('button', { name: 'Next' }).click()
await page.getByLabel('Enter your password').fill(password)
await page.getByRole('button', { name: 'Next' }).click()

// Wait for redirect back to app
await page.waitForURL('{{STAGING_URL}}/**')
await page.context().storageState({ path: profilePath })
```

**Common gotchas:**
- OAuth providers may show consent screens on first login — approve them
- Google may require "Use another account" click if a session already exists
- Popup-based OAuth needs `page.waitForEvent('popup')` to handle the new window
- Keycloak: use direct realm login URL to skip the provider selection page

## Keycloak (common for enterprise)

```typescript
// Direct realm login (skips provider selection)
await page.goto('{{KEYCLOAK_URL}}/realms/{{REALM}}/protocol/openid-connect/auth?client_id={{CLIENT_ID}}&redirect_uri={{STAGING_URL}}/callback&response_type=code&scope=openid')
await page.getByLabel('Username or email').fill(email)
await page.getByLabel('Password').fill(password)
await page.getByRole('button', { name: 'Sign In' }).click()
await page.waitForURL('{{STAGING_URL}}/**')
await page.context().storageState({ path: profilePath })
```

## Token-Based (API Key / JWT in localStorage)

Some SPAs store auth tokens in localStorage or sessionStorage instead of cookies.

```typescript
await page.goto('{{STAGING_URL}}')
await page.evaluate(({ token, refreshToken }) => {
  localStorage.setItem('auth_token', token)
  localStorage.setItem('refresh_token', refreshToken)
}, { token: process.env.AUTH_TOKEN, refreshToken: process.env.AUTH_REFRESH_TOKEN })
await page.reload()
await page.waitForURL('**/dashboard**')
await page.context().storageState({ path: profilePath })
```

**Common gotchas:**
- Token may need to be a valid JWT (not expired) — generate fresh tokens in CI
- Some apps check token validity on load — reload after setting localStorage
- sessionStorage is per-tab and not captured by `storageState()` — use localStorage

## Session Storage (not captured by storageState)

Playwright's `storageState()` captures cookies and localStorage but NOT sessionStorage. If the app uses sessionStorage for auth:

```typescript
// After login, manually capture sessionStorage
const sessionData = await page.evaluate(() => JSON.stringify(sessionStorage))

// In tests, restore it:
await page.evaluate((data) => {
  const entries = JSON.parse(data)
  for (const [key, value] of Object.entries(entries)) {
    sessionStorage.setItem(key, value as string)
  }
}, sessionData)
```

## Profile Expiry

Auth sessions expire. Common patterns:

| Auth Method | Typical Expiry | Detection |
|-------------|---------------|-----------|
| Form + cookie | 24h-30d | Cookie `expires` field |
| OAuth | 1h (access) + 7d (refresh) | Token `exp` claim |
| Keycloak | Realm session timeout | Redirect to login |
| JWT in localStorage | 1h-24h | Token `exp` claim |

**Detection heuristics:**
1. storageState file age > 24h → probably expired
2. Navigate to protected page → check if redirected to login
3. Check cookie expiry dates in storageState JSON
4. Parse JWT `exp` claim from localStorage token

## Multi-User Test Patterns

### Two users interacting
```typescript
const adminCtx = await browser.newContext({ storageState: '.playwright/profiles/admin.json' })
const viewerCtx = await browser.newContext({ storageState: '.playwright/profiles/viewer.json' })
// Each context has its own cookies/storage — no interference
```

### Anonymous + authenticated comparison
```typescript
const anonCtx = await browser.newContext() // no storageState = anonymous
const authCtx = await browser.newContext({ storageState: '.playwright/profiles/admin.json' })
// Compare what each sees
```

### Role-based access testing
```typescript
const roles = ['admin', 'editor', 'viewer']
for (const role of roles) {
  const ctx = await browser.newContext({ storageState: `.playwright/profiles/${role}.json` })
  const page = await ctx.newPage()
  await page.goto('/admin/settings')
  // admin: sees settings, editor: sees settings, viewer: redirected
  await ctx.close()
}
```

## CI Secrets Setup

| Provider | How to set secrets |
|----------|-------------------|
| GitHub Actions | Settings → Secrets → Actions → New repository secret |
| GitLab CI | Settings → CI/CD → Variables |
| Vercel | Settings → Environment Variables |

**Naming convention:** `AUTH_{ROLE}_{FIELD}` — e.g., `AUTH_ADMIN_EMAIL`, `AUTH_ADMIN_PASSWORD`

## Security Notes

- Never commit storageState JSON files (they contain session tokens)
- Add `.playwright/profiles/*.json` to `.gitignore`
- Do commit `.playwright/profiles.json` (the registry — no secrets)
- Use dedicated test accounts, not personal accounts
- Test accounts should have minimal permissions needed for their role
- Rotate test account passwords on the same schedule as real accounts
