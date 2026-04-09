---
name: layout-audit
description: Audit page layout for CSS bugs that axe-core can't detect — sticky nav, overflow, z-index, responsive stacking, content clipping.
disable-model-invocation: true
argument-hint: [run|write] [--page <slug>]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Read Write Edit Glob Grep
---

# Layout Audit

Catches CSS and structural layout bugs that accessibility scanners miss: broken sticky positioning, horizontal overflow, z-index stacking issues, content clipping, and responsive layout failures.

## Phase 0: Load Context (mandatory)

1. Read [references/layout-checklist.md](references/layout-checklist.md)
2. Read `e2e/tests/layout.spec.ts` (if it exists)
3. Read `e2e/fixtures/test-constants.ts` for page slugs

## Commands

### `/layout-audit run`

Run existing layout tests:
```bash
npx playwright test e2e/tests/layout.spec.ts --project=chromium
```

If no layout tests exist, run `/layout-audit write` first.

### `/layout-audit write`

Create or update `e2e/tests/layout.spec.ts` using the checklist from `references/layout-checklist.md`. Test against the XXL page (or `--page <slug>` if specified).

### `/layout-audit --page <slug>`

Run the audit against a specific page instead of the default XXL page.

## What It Checks (10 areas)

1. **Sticky nav** — position: sticky, top: 0, visible after scroll, z-index above content
2. **No horizontal overflow** — desktop and mobile, no horizontal scrollbar
3. **Content below nav** — first section doesn't overlap the nav
4. **Footer at bottom** — footer below the fold on content-rich pages
5. **Max-width container** — content doesn't exceed max-w-screen-xl (1280px)
6. **Mobile stacking** — grids collapse to single column, container is full-width
7. **All content reachable** — last section is scrollable into viewport
8. **No content clipped** — overflow-hidden doesn't hide interactive elements
9. **Z-index stacking** — modals > nav > content (no inversions)
10. **Responsive images** — images don't overflow their containers

## Rules

1. Use `page.evaluate(() => getComputedStyle(...))` to check CSS properties
2. Use `toBeInViewport()` for scroll visibility checks
3. Test at both desktop (1280x800) and mobile (375x812)
4. Don't use CSS class assertions for computed values — classes can be overridden
5. These tests complement axe-core, not replace it — always run `checkA11y()` too
