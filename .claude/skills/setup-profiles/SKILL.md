---
name: setup-profiles
description: Create and manage Playwright auth profiles (storageState) for testing logged-in features, role-based access, and multi-user workflows.
disable-model-invocation: true
argument-hint: [create|list|refresh] [role-name]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Read Write Edit Glob Grep Agent
---

# Auth Profile Manager

Create reusable Playwright authentication profiles so tests can run as different user roles (admin, editor, viewer, anonymous) without logging in every time.

## How It Works

Playwright's `storageState` captures cookies, localStorage, and sessionStorage after login. Tests restore this state to skip the login flow — faster, more reliable, and supports testing role-based features.

```
.playwright/
├── profiles.json              # Profile registry (committed)
└── profiles/
    ├── admin.json             # storageState for admin role (gitignored)
    ├── editor.json            # storageState for editor role (gitignored)
    └── viewer.json            # storageState for viewer role (gitignored)
```

## Phase 0: Load Context (mandatory)

1. Read [references/auth-patterns.md](references/auth-patterns.md)
2. Read `./e2e/fixtures/test-constants.ts`
3. Read `./.playwright/profiles.json` (if it exists)
4. Glob `./.playwright/profiles/*.json`

## Commands

### `/setup-profiles create [role-name]`

Interactive login to capture auth state for a role.

**Steps:**

1. Ask the user for:
   - Role name (e.g., `admin`, `editor`, `viewer`)
   - Login URL (e.g., `/login`, `/auth/signin`)
   - Credentials or auth method (form login, OAuth, SSO)

2. Launch Playwright in headed mode to perform the login:

```bash
cd .
npx playwright test --project=chromium --headed auth-setup.ts
```

3. Generate `auth-setup.ts` (or update if it exists):

```typescript
import { test as setup } from '@playwright/test'

setup('authenticate as {role}', async ({ page }) => {
  await page.goto('https://therainyblossom.github.io/storyblok-test//login')

  // Form-based login
  await page.getByLabel('Email').fill(process.env.AUTH_{ROLE}_EMAIL ?? '{email}')
  await page.getByLabel('Password').fill(process.env.AUTH_{ROLE}_PASSWORD ?? '{password}')
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Wait for auth to complete
  await page.waitForURL('**/dashboard**')

  // Save storage state
  await page.context().storageState({ path: '.playwright/profiles/{role}.json' })
})
```

4. Register the profile in `.playwright/profiles.json`:

```json
{
  "profiles": {
    "admin": {
      "storageState": ".playwright/profiles/admin.json",
      "description": "Full access admin account",
      "loginUrl": "/login",
      "authMethod": "form",
      "envVars": {
        "email": "AUTH_ADMIN_EMAIL",
        "password": "AUTH_ADMIN_PASSWORD"
      }
    }
  }
}
```

5. Add to `.gitignore`:

```
.playwright/profiles/*.json
!.playwright/profiles.json
```

### `/setup-profiles list`

Show all registered profiles and their status:

```typescript
const profiles = JSON.parse(fs.readFileSync('.playwright/profiles.json', 'utf-8'))
for (const [role, config] of Object.entries(profiles.profiles)) {
  const exists = fs.existsSync(config.storageState)
  const stats = exists ? fs.statSync(config.storageState) : null
  const age = stats ? Math.round((Date.now() - stats.mtimeMs) / 3600000) : null
  console.log(`${role}: ${exists ? `valid (${age}h old)` : 'MISSING — run /setup-profiles refresh'}`)
}
```

### `/setup-profiles refresh [role-name]`

Re-run the login flow to capture fresh storageState. Sessions expire — profiles need periodic refresh.

**Expiry detection heuristics:**
- storageState file older than 24h (configurable)
- Navigation to a protected page redirects to login
- Auth cookie has `expires` in the past

## Using Profiles in Tests

### Option A: Playwright project per role

```typescript
// playwright.config.ts
projects: [
  {
    name: 'admin',
    use: {
      storageState: '.playwright/profiles/admin.json',
      ...devices['Desktop Chrome'],
    },
  },
  {
    name: 'viewer',
    use: {
      storageState: '.playwright/profiles/viewer.json',
      ...devices['Desktop Chrome'],
    },
  },
]
```

### Option B: Per-test role switching

```typescript
import { test, expect } from '../fixtures/base'

test.describe('Admin dashboard', () => {
  test.use({ storageState: '.playwright/profiles/admin.json' })

  test('can access user management', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.getByRole('heading')).toContainText('Users')
  })
})

test.describe('Viewer dashboard', () => {
  test.use({ storageState: '.playwright/profiles/viewer.json' })

  test('cannot access user management', async ({ page }) => {
    await page.goto('/admin/users')
    // Should redirect to forbidden or dashboard
    await expect(page).not.toHaveURL(/admin\/users/)
  })
})
```

### Option C: Multi-user tests (two browsers)

```typescript
test('admin action visible to viewer', async ({ browser }) => {
  const adminCtx = await browser.newContext({
    storageState: '.playwright/profiles/admin.json',
  })
  const viewerCtx = await browser.newContext({
    storageState: '.playwright/profiles/viewer.json',
  })

  const adminPage = await adminCtx.newPage()
  const viewerPage = await viewerCtx.newPage()

  // Admin creates content
  await adminPage.goto('/admin/posts/new')
  await adminPage.getByLabel('Title').fill('Test Post')
  await adminPage.getByRole('button', { name: 'Publish' }).click()

  // Viewer sees it
  await viewerPage.goto('/posts')
  await expect(viewerPage.getByText('Test Post')).toBeVisible()

  await adminCtx.close()
  await viewerCtx.close()
})
```

## Auth Methods

### Form login (most common)
```typescript
await page.getByLabel('Email').fill(email)
await page.getByLabel('Password').fill(password)
await page.getByRole('button', { name: 'Sign in' }).click()
```

### OAuth / SSO (Google, GitHub, Keycloak, etc.)
```typescript
// Click OAuth button, handle redirect
await page.getByRole('button', { name: 'Sign in with Google' }).click()
// Fill OAuth provider form (may need to handle popup)
await page.getByLabel('Email').fill(email)
await page.getByRole('button', { name: 'Next' }).click()
await page.getByLabel('Password').fill(password)
await page.getByRole('button', { name: 'Sign in' }).click()
// Wait for redirect back to app
await page.waitForURL('**/dashboard**')
```

### Token-based (API key in localStorage)
```typescript
await page.goto('https://therainyblossom.github.io/storyblok-test/')
await page.evaluate((token) => {
  localStorage.setItem('auth_token', token)
}, process.env.AUTH_TOKEN)
await page.reload()
```

## CI Integration

In CI, profiles are created from environment variables at the start of the pipeline:

```yaml
e2e-tests:
  stage: test
  script:
    - cd .
    - npm ci
    - npx playwright install chromium --with-deps
    # Create auth profiles from CI secrets
    - npx playwright test auth-setup.ts --project=chromium
    # Run tests with profiles
    - npx playwright test --project=admin --project=viewer
  variables:
    AUTH_ADMIN_EMAIL: $STAGING_ADMIN_EMAIL
    AUTH_ADMIN_PASSWORD: $STAGING_ADMIN_PASSWORD
    AUTH_VIEWER_EMAIL: $STAGING_VIEWER_EMAIL
    AUTH_VIEWER_PASSWORD: $STAGING_VIEWER_PASSWORD
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `AUTH_{ROLE}_EMAIL` | Login email for role |
| `AUTH_{ROLE}_PASSWORD` | Login password for role |
| `AUTH_TOKEN` | API token (for token-based auth) |

Store in `.env.local` (gitignored) for local dev, CI secrets for pipelines.
