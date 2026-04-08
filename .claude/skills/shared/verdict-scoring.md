# Verdict Scoring

Standard scoring formula used by all audit skills. Add this verdict block at the top of every audit report.

## Formula

```
Score = 100 - (critical × 10) - (major × 5) - (minor × 2) - (info × 0)
Score = max(0, min(100, score))
```

Where:
- **Critical** = P0, critical severity, or FAIL on a must-have check
- **Major** = P1, serious severity, or FAIL on an important check
- **Minor** = P2, moderate severity, or FAIL on a nice-to-have check
- **Info** = P3, cosmetic, or informational findings

## Severity Mapping

Different skills use different labels. Map them to the scoring tiers:

| Skill | Critical | Major | Minor | Info |
|-------|----------|-------|-------|------|
| qa-audit | P0 | P1 | P2 | P3 |
| qa-a11y | Critical | Serious | Moderate | Minor |
| seo-audit | Critical | Major | Minor | Info |
| perf-audit | Over budget (critical metric) | Over budget (other) | Warning (within 20%) | — |
| link-check | Broken (404/500) | Redirect chain >2 | Missing rel="noopener" | — |
| security-headers | Missing CSP/HSTS | Missing other headers | Info disclosure | — |
| content-governance | Broken/missing content | Oversized/overflow | Generic alt, long heading | — |

## Verdicts

| Score | Verdict | CI Action | Meaning |
|-------|---------|-----------|---------|
| 90-100 | PASS | Merge allowed | Clean or minor issues only |
| 75-89 | CONCERNS | Merge with caveats | Notable issues, none blocking |
| 60-74 | REWORK | Fix before merge | Significant issues that affect users |
| 0-59 | FAIL | Block merge | Critical issues, do not ship |

## Report Block

Add this at the top of every audit report, before the detailed findings:

```markdown
## Verdict: {PASS|CONCERNS|REWORK|FAIL} — Score: {n}/100

| Severity | Count | Weight | Demerits |
|----------|-------|--------|----------|
| Critical | {n} | ×10 | {n} |
| Major | {n} | ×5 | {n} |
| Minor | {n} | ×2 | {n} |
| **Total demerits** | | | **{n}** |
```
