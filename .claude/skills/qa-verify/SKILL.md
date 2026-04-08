---
name: qa-verify
description: Verify bug reports from other skills — reproduce each finding, dismiss false positives, classify by confidence, and produce a verified bug list.
disable-model-invocation: true
argument-hint: [report-file-or-feature] [--source qa-audit|bug-hunter|qa-a11y|seo-audit|perf-audit|link-check|security-headers]
allowed-tools: Bash(npx playwright *) Bash(cd * && npx playwright *) Bash(node *) Bash(curl *) Read Write Edit Glob Grep Agent
---

# Bug Verification

Reproduce findings from other skills. Dismiss false positives. Produce a verified bug list.

**Run this after any audit or bug-hunting skill.** Unverified findings waste developer time and erode trust in the test suite.

## Phase 0: Load Context (mandatory)

1. Read [references/false-positive-patterns.md](references/false-positive-patterns.md)
2. Read the source report (the file or output from the skill that found the bugs)
3. Read `{{FRONTEND_DIR}}/e2e/fixtures/test-constants.ts`
4. Read `shared/conventions.md`

Do NOT verify any finding before all files are loaded.

## Phase 1: Triage

Read the source report and categorize each finding:

| Category | Action |
|----------|--------|
| Clearly reproducible (crash, 404, missing element) | Fast-track to Phase 2 |
| Potentially environment-specific (headers, perf, redirects) | Flag for environment check |
| Known false-positive pattern (see references) | Pre-mark as suspect |
| Needs interaction to reproduce (state, timing, keyboard) | Queue for manual probe |

## Phase 2: Reproduce

For each finding, attempt to reproduce using Playwright. The goal is a **standalone script** that either confirms or refutes the bug.

### Reproduction Template

```javascript
const { chromium } = require(require.resolve('@playwright/test', { paths: [process.cwd()] }))
;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    httpCredentials: { username: '{{AUTH_USER}}', password: '{{AUTH_PASS}}' },
  })
  const page = await ctx.newPage()

  // FINDING: {id} — {description}
  // SOURCE: {skill} report
  await page.goto('{{STAGING_URL}}/path', { waitUntil: 'networkidle' })

  // REPRODUCE:
  // {steps from the finding}

  // VERIFY:
  const result = /* check if the bug is present */
  console.log('FINDING {id}:', result ? 'CONFIRMED' : 'NOT REPRODUCED')

  await browser.close()
})()
```

### Verification Strategies by Source

#### From `/qa-a11y` (accessibility)
- **Contrast violations**: Cross-validate with `filterFalseContrastViolations()` from `helpers/accessibility.ts`. If axe reports a violation but `getComputedStyle` shows passing contrast, it's a false positive.
- **Missing alt text**: Check if the image is genuinely decorative (has `role="presentation"` or is inside a link with text). Decorative images with empty `alt=""` are correct.
- **Heading hierarchy**: Verify the heading is actually visible (not `display:none` or `aria-hidden`). Hidden headings don't affect user experience.
- **Keyboard traps**: Attempt to Tab out manually. Some components use intentional focus trapping (modals) that axe flags incorrectly.
- **ARIA issues**: Check if the component uses a non-standard but functional pattern (e.g., custom combobox that works but doesn't match ARIA spec exactly).

#### From `/qa-audit` (functional)
- **Responsive overflow**: Resize to the exact breakpoint. Check if it's a 1px rounding issue vs. real content clipping. Use `scrollWidth > clientWidth` to confirm.
- **i18n fallback**: Verify the default-locale text isn't just a shared string that's identical across locales (e.g., brand names, URLs).
- **Link errors**: Re-check with a fresh request. Staging CDNs cache aggressively — a 404 may be stale cache.

#### From `/bug-hunter` (adversarial)
- **Timing bugs**: Run the probe 5 times. If it fails < 2/5, it's flaky, not a confirmed bug.
- **State bugs**: Clear cookies and local storage, then reproduce. If the bug only occurs with stale state, note the precondition.
- **URL injection**: Check if the XSS/injection actually renders or if the framework escapes it. View-source the rendered HTML.

#### From `/seo-audit`
- **Missing meta tags**: Check if tags are injected by CDN/edge worker in production. Compare staging vs. production response headers.
- **robots.txt blocking**: Staging often has `Disallow: /` intentionally. Check production separately.
- **Missing structured data**: Some CMS platforms inject JSON-LD server-side only in production builds.

#### From `/perf-audit`
- **Slow LCP**: Run 3 times, take the median. Staging servers are often underpowered — a 4s LCP on staging may be 1.5s in production.
- **Large bundle**: Check if the bundle size includes source maps (staging often serves them, production doesn't).
- **Render-blocking resources**: Check if the CDN applies async loading that staging doesn't have.

#### From `/link-check`
- **External 403s**: Many sites block automated HEAD requests (LinkedIn, Instagram, etc.). Try a GET with a browser user agent. If it loads in a browser, it's not broken.
- **Internal redirects**: Check if the redirect is intentional (trailing slash normalization, locale redirect). A 301 isn't always a bug.

#### From `/security-headers`
- **Missing CSP/HSTS**: Check production, not just staging. These headers are commonly added by the CDN/reverse proxy, not the application.
- **Cookie flags**: Session cookies may only appear after login. Test with an authenticated session.

## Phase 3: Environment Check

For findings that may be environment-specific:

```bash
# Compare staging vs production headers
curl -sI '{{STAGING_URL}}/path' > /tmp/staging-headers.txt
curl -sI 'https://production-url.com/path' > /tmp/prod-headers.txt
diff /tmp/staging-headers.txt /tmp/prod-headers.txt
```

If the finding only exists on staging and production is fine, classify as **Environment-Specific** (not a bug, but document the difference).

## Phase 4: Classify

For each finding, assign a verdict:

| Verdict | Meaning | Action |
|---------|---------|--------|
| **Confirmed** | Reproduced reliably, real user impact | Keep in report, write failing test |
| **False Positive** | Not reproducible, or tooling artifact | Remove from report, document why |
| **Environment-Specific** | Only on staging, production is fine | Note in report, don't write test |
| **Flaky** | Reproduces < 50% of attempts | Note in report, investigate root cause |
| **Needs Manual Review** | Can't determine programmatically | Flag for human review |

### Confidence Scoring

Rate each confirmed finding:

| Confidence | Criteria |
|------------|----------|
| **High** | Reproduced 3+ times, clear user impact, specific steps |
| **Medium** | Reproduced but depends on timing/state/viewport |
| **Low** | Reproduced once, may be environment-dependent |

## Phase 5: Write Verified Tests

For **Confirmed** findings only, write failing tests in `e2e/tests/{feature}-verified.spec.ts`:

```typescript
import { test, expect } from '../fixtures/base'

test.describe('Verified Bugs', () => {
  test('BUG-001: filter reset does not clear URL params', async ({ page }) => {
    // Verified: 2025-04-08, source: /qa-audit, confidence: high
    await page.goto('/resources?category=Guides')
    await page.getByRole('button', { name: 'Reset' }).click()
    // BUG: URL still contains ?category=Guides after reset
    await expect(page).toHaveURL(/^(?!.*category)/)
  })
})
```

## Phase 6: Report

```markdown
# Verification Report: {Source Skill} findings

## Summary
| Verdict | Count |
|---------|-------|
| Confirmed | {n} |
| False Positive | {n} |
| Environment-Specific | {n} |
| Flaky | {n} |
| Needs Manual Review | {n} |

## Confirmed Bugs
### BUG-{id}: {title}
- **Source**: {skill} finding #{n}
- **Confidence**: High/Medium/Low
- **Reproduced**: {n}/{n} attempts
- **Steps**: ...
- **Expected**: ...
- **Actual**: ...
- **Test**: `e2e/tests/{file}:{line}`

## Dismissed (False Positives)
### FP-{id}: {original finding title}
- **Source**: {skill} finding #{n}
- **Reason**: {why it's a false positive}
- **Evidence**: {what the verification showed}

## Environment-Specific
### ENV-{id}: {title}
- **Source**: {skill} finding #{n}
- **Staging**: {behavior on staging}
- **Production**: {behavior on production}
- **Action**: {none / fix staging config / add to known differences}

## Needs Manual Review
### REVIEW-{id}: {title}
- **Source**: {skill} finding #{n}
- **Why**: {why automated verification couldn't determine}
- **Suggestion**: {what a human should check}
```
