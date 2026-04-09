# How-To Guide

## Project Setup

### Prerequisites

- Node.js 22+
- npm
- GitHub CLI (`gh`) — for deployments and secrets
- Storyblok CLI — `npx storyblok login`

### Clone & Install

```bash
git clone https://github.com/therainyblossom/storyblok-test.git
cd storyblok-test
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```
NUXT_PUBLIC_SPACE_ID=291713566231447
NUXT_PUBLIC_STORYBLOK_ACCESS_TOKEN=<your-preview-token>
NUXT_PUBLIC_NODE_ENV=development
NUXT_PUBLIC_AUTH_ENABLED=false
PORT=3000
```

Get the preview token from Storyblok: **Space Settings > Access Tokens**.

### Run Locally

```bash
npm run dev              # http://localhost:3000
npm run dev-ssl          # https://localhost:3000 (for Visual Editor)
```

For SSL, generate certificates first:

```bash
brew install mkcert && mkcert -install && mkcert localhost
```

---

## Storyblok Connection

### Space Info

- **Space ID:** 291713566231447
- **Region:** EU
- **GitHub Pages URL:** https://therainyblossom.github.io/storyblok-test/

### GitHub Secrets (already configured)

| Secret | Purpose |
|--------|---------|
| `STORYBLOK_ACCESS_TOKEN` | Preview token for builds |
| `STORYBLOK_SPACE_ID` | Space identifier |
| `STAGING_URL` | GitHub Pages URL for e2e tests |

### Visual Editor

The Visual Editor only works with a running dev server (not GitHub Pages). Set the preview URL in Storyblok to `https://localhost:3000/` and run `npm run dev-ssl`.

---

## Component Workflow

### How Components Work

Each Storyblok component has two parts:

1. **Schema** — defined in Storyblok, controls what fields editors see in the CMS
2. **Vue template** — in `storyblok/*.vue`, renders the component on the frontend

These must match. If a Vue template references `blok.fieldName`, that field must exist in the schema with the correct type.

### Creating a New Component

1. **Create the schema** in Storyblok (UI or CLI):
   ```bash
   npx storyblok login
   # Then create via the Storyblok web UI: Space > Block Library > New Block
   ```

2. **Create the Vue file** in `storyblok/YourComponent.vue`:
   ```vue
   <script setup lang="ts">
   defineProps({
     blok: { type: Object, required: true }
   })
   </script>

   <template>
     <div v-editable="blok">
       {{ blok.yourField }}
     </div>
   </template>
   ```

3. **Use it in content** — add it to a page in the Storyblok editor.

### Pushing Schemas

Export current schemas from the space:

```bash
npx storyblok components pull --space 291713566231447
```

Push schemas to the space (after editing the JSON):

```bash
npx storyblok components push --space 291713566231447
```

The schema JSON is tracked in `components.291713566231447.json`.

### Checking for Mismatches

Common issues:
- **Field name mismatch** — template uses `blok.featuredIn` but schema has `featuredInText`
- **Type mismatch** — template treats `blok.url` as a string but schema type is `multilink` (object)
- **Unsafe access** — `blok.link.story` crashes if `link` is empty; use `blok.link?.story` instead

Rules:
- Always use optional chaining (`?.`) when accessing nested properties on blok fields
- Multilink fields are objects — access `.url`, `.cached_url`, `.story?.full_slug`, `.target`
- Asset fields are objects — access `.filename`, `.alt`
- Check the schema type before using a field in the template

---

## CI/CD & Deployment

### Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production — protected, requires 1 review |
| `dev` | Integration — merge feature branches here first |
| `fix/*`, `feat/*` | Feature branches — PR to `dev` |

### GitHub Actions Workflows

#### `deploy.yml` — Deploy to GitHub Pages

- **Triggers:** push to `main`, every 6 hours (cron), manual
- **What it does:** `nuxt generate` → upload to GitHub Pages
- **URL:** https://therainyblossom.github.io/storyblok-test/

The 6-hour cron ensures content changes in Storyblok are picked up without manual deploys.

To trigger manually:
```bash
gh workflow run deploy.yml --repo therainyblossom/storyblok-test --ref main
```

#### `e2e.yml` — Accessibility Tests

- **Triggers:** PRs to `main` or `dev`, manual
- **What it does:** builds site locally → serves with `serve` → runs Playwright + axe-core
- **Reports:** uploaded as artifacts (14-day retention)

Tests check WCAG 2.1 AA compliance. Critical/serious violations fail the build.

### Deploying Changes

1. Create a feature branch from `dev`:
   ```bash
   git checkout dev && git checkout -b fix/my-change
   ```

2. Make changes, commit, push, open PR to `dev`:
   ```bash
   git push -u origin fix/my-change
   gh pr create --base dev
   ```

3. E2E tests run automatically on the PR.

4. After review, merge to `dev`.

5. When ready for production, create a PR from `dev` to `main`:
   ```bash
   gh pr create --base main --head dev
   ```

6. After approval and merge, the deploy workflow publishes to GitHub Pages.

### Content Changes (No Code)

When editors change content in Storyblok:
- The site rebuilds automatically every 6 hours
- Or trigger manually: `gh workflow run deploy.yml --ref main`

---

## Running E2E Tests Locally

```bash
# Build the static site first
NUXT_PUBLIC_STORYBLOK_ACCESS_TOKEN=<token> NUXT_PUBLIC_SPACE_ID=291713566231447 npx nuxt generate

# Run tests (serve starts automatically via playwright.config.ts webServer)
npx playwright test --project=chromium

# Run headed (watch the browser)
npx playwright test --project=chromium --headed

# View the HTML report
npx playwright show-report e2e/reports
```

---

## Auto Test Generation (Pre-Push Hook)

A git `pre-push` hook automatically generates e2e tests for changed components using Claude Code CLI (runs locally with your Premium plan).

### Setup

```bash
# Install Claude Code CLI (one-time)
npm install -g @anthropic-ai/claude-code

# Install the git hook
./scripts/install-hooks.sh
```

### How It Works

1. You change a component in `storyblok/` or `components/`
2. You `git push` on a feature branch
3. The hook detects changed component files
4. Claude Code generates/updates spec files in `e2e/tests/`
5. Playwright runs the tests
6. If they pass, the hook auto-commits the test files into your push

### Skips When

- Pushing from `main` or `dev` (no test generation needed)
- No component files changed in the branch

### Files

- `scripts/hooks/pre-push` — the hook source (tracked in git)
- `scripts/install-hooks.sh` — installs the hook to `.git/hooks/`
- `.git/hooks/pre-push` — the active hook (not tracked, created by install script)
