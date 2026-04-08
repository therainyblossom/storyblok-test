---
name: bug-hunter
description: Hunt for bugs by reading source code to find assumptions, then writing Playwright exploit scripts to break them. Adversarial testing beyond QA audits.
disable-model-invocation: true
argument-hint: [feature-or-component-name]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(curl *) Bash(git *) Read Write Edit Glob Grep Agent
---

# Bug Hunter

Read the code, find the assumptions, then break them.

## Phase 0: Load Context (mandatory)

1. Read [references/attack-patterns.md](references/attack-patterns.md)
2. Read `qa-audit/references/known-patterns.md`
3. Read `shared/risk-patterns.md`
4. Read `{{FRONTEND_DIR}}/e2e/fixtures/test-constants.ts`
5. Glob `{{FRONTEND_DIR}}/e2e/tests/*-bugs.spec.ts`

Do NOT write any probe or test before all files are loaded.

## The Loop

```
1. Read the code — find assumptions
2. Hypothesize — "this will break if..."
3. Prove it — write a Playwright probe script
4. Document — failing test + root cause + severity
5. Repeat — each bug reveals new attack surfaces
```

## Source Code Smells

### State Management
- Stale closures, race conditions, missing resets, derived state conflicts

### URL Parameters
- Merge vs replace, encoding, type coercion, missing/extra params

### Boundaries
- Empty arrays vs null vs undefined, off-by-one, case-sensitive matching, API pagination limits

### DOM/Rendering
- v-if vs v-show (focus management), missing :key, SSR hydration mismatch

### Timing
- Click during transition, double submit, navigate during fetch, resize during interaction

## Probe Script Template

```javascript
const { chromium } = require(require.resolve('@playwright/test', { paths: [process.cwd()] }))
;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    httpCredentials: { username: '{{AUTH_USER}}', password: '{{AUTH_PASS}}' },
  })
  const page = await ctx.newPage()
  // HYPOTHESIS: ...
  await page.goto('{{STAGING_URL}}/path', { waitUntil: 'networkidle' })
  // PROOF: ...
  console.log('Result:', /* observed behavior */)
  await browser.close()
})()
```

See [references/attack-patterns.md](references/attack-patterns.md) for copy-paste probes.

## Output

1. **Bug report** (markdown) — all confirmed bugs with P0-P3 severity
2. **Failing tests** (`{feature}-bugs.spec.ts`) — one test per bug
