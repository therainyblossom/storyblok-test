import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter'
import * as fs from 'fs'
import * as path from 'path'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface A11yViolation {
  id: string
  impact: string
  description: string
  helpUrl: string
  tags?: string[]
  nodes: Array<{ html: string; target?: string[]; failureSummary?: string }>
}

interface ManualFinding {
  category: string
  rule: string
  impact: string
  status: 'pass' | 'fail'
  description: string
  selector?: string
  details?: string
}

interface AxeResult {
  url: string
  violations: A11yViolation[]
}

interface ManualResult {
  url: string
  findings: ManualFinding[]
}

interface PageScore {
  url: string
  axeViolations: number
  manualPasses: number
  manualFailures: number
  score: number // 0–100
  grade: string // A, B, C, D, F
}

const IMPACT_ORDER = ['critical', 'serious', 'moderate', 'minor'] as const
const IMPACT_COLORS: Record<string, string> = {
  critical: '#d32f2f',
  serious: '#e65100',
  moderate: '#f9a825',
  minor: '#1565c0',
}
const IMPACT_WEIGHTS: Record<string, number> = {
  critical: 10,
  serious: 5,
  moderate: 2,
  minor: 1,
}
const STATUS_COLORS: Record<string, string> = {
  pass: '#2e7d32',
  fail: '#d32f2f',
}

function gradeFromScore(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

/**
 * Playwright reporter that merges axe-core results and manual a11y findings
 * into a single scored HTML + JSON report.
 *
 * Collects two attachment types:
 * - `_a11y-result` — from checkA11y fixture (axe-core violations)
 * - `_manual-a11y-result` — from reportA11y fixture (keyboard/focus/heading checks)
 *
 * Usage in playwright.config.ts:
 *   reporter: [['list'], ['./e2e/reporters/a11y-reporter.ts']]
 */
class A11yReporter implements Reporter {
  private axeResults: AxeResult[] = []
  private manualResults: ManualResult[] = []

  onTestEnd(_test: TestCase, result: TestResult) {
    for (const attachment of result.attachments) {
      const data = attachment.body
        ? attachment.body.toString()
        : attachment.path
          ? fs.readFileSync(attachment.path, 'utf-8')
          : null
      if (!data) continue

      try {
        if (attachment.name === '_a11y-result') {
          this.axeResults.push(JSON.parse(data))
        } else if (attachment.name === '_manual-a11y-result') {
          this.manualResults.push(JSON.parse(data))
        }
      } catch {
        /* skip malformed attachments */
      }
    }
  }

  onEnd(_result: FullResult) {
    if (this.axeResults.length === 0 && this.manualResults.length === 0) return

    const outDir = path.join(process.cwd(), 'e2e', 'reports', 'a11y')
    fs.mkdirSync(outDir, { recursive: true })

    const mergedAxe = this.mergeAxeByRuleId(this.axeResults)
    const mergedManual = this.mergeManualByRule(this.manualResults)
    const allUrls = [
      ...new Set([
        ...this.axeResults.map((r) => r.url),
        ...this.manualResults.map((r) => r.url),
      ]),
    ]
    const scores = this.scorePages(allUrls)

    // JSON
    fs.writeFileSync(
      path.join(outDir, 'a11y-results.json'),
      JSON.stringify(
        { scores, axeViolations: mergedAxe, manualFindings: mergedManual, urls: allUrls },
        null,
        2,
      ),
    )

    // HTML
    fs.writeFileSync(path.join(outDir, 'a11y-report.html'), this.buildHTML(mergedAxe, mergedManual, scores))

    const axeTotal = mergedAxe.reduce((s, v) => s + v.nodes.length, 0)
    const manualFails = mergedManual.filter((f) => f.status === 'fail').length
    const manualPasses = mergedManual.filter((f) => f.status === 'pass').length
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, p) => s + p.score, 0) / scores.length) : 0

    console.log(`\n  A11y report: ${mergedAxe.length} axe rules, ${axeTotal} elements`)
    console.log(`  Manual checks: ${manualPasses} passed, ${manualFails} failed`)
    console.log(`  Average score: ${avgScore}/100 (${gradeFromScore(avgScore)})`)
    console.log(`  HTML: ${path.join(outDir, 'a11y-report.html')}`)
    console.log(`  JSON: ${path.join(outDir, 'a11y-results.json')}\n`)
  }

  // -------------------------------------------------------------------------
  // Merging
  // -------------------------------------------------------------------------

  private mergeAxeByRuleId(results: AxeResult[]): (A11yViolation & { urls: string[] })[] {
    const map = new Map<string, A11yViolation & { urls: string[] }>()

    for (const result of results) {
      for (const v of result.violations) {
        const existing = map.get(v.id)
        if (existing) {
          existing.nodes.push(...v.nodes)
          if (!existing.urls.includes(result.url)) existing.urls.push(result.url)
        } else {
          map.set(v.id, { ...v, urls: [result.url] })
        }
      }
    }

    const order = Object.fromEntries(IMPACT_ORDER.map((v, i) => [v, i]))
    return Array.from(map.values()).sort((a, b) => (order[a.impact] ?? 9) - (order[b.impact] ?? 9))
  }

  private mergeManualByRule(results: ManualResult[]): (ManualFinding & { urls: string[] })[] {
    const map = new Map<string, ManualFinding & { urls: string[] }>()

    for (const result of results) {
      for (const f of result.findings) {
        const key = `${f.rule}::${f.status}`
        const existing = map.get(key)
        if (existing) {
          if (!existing.urls.includes(result.url)) existing.urls.push(result.url)
          // Keep the most detailed version
          if (f.details && (!existing.details || f.details.length > existing.details.length)) {
            existing.details = f.details
          }
        } else {
          map.set(key, { ...f, urls: [result.url] })
        }
      }
    }

    const order = Object.fromEntries(IMPACT_ORDER.map((v, i) => [v, i]))
    return Array.from(map.values()).sort((a, b) => {
      // Failures first, then by impact
      if (a.status !== b.status) return a.status === 'fail' ? -1 : 1
      return (order[a.impact] ?? 9) - (order[b.impact] ?? 9)
    })
  }

  // -------------------------------------------------------------------------
  // Scoring
  // -------------------------------------------------------------------------

  private scorePages(urls: string[]): PageScore[] {
    return urls.map((url) => {
      // Axe demerits: weighted by impact severity
      const axeViolations = this.axeResults
        .filter((r) => r.url === url)
        .flatMap((r) => r.violations)
      let axeDemerits = 0
      for (const v of axeViolations) {
        axeDemerits += v.nodes.length * (IMPACT_WEIGHTS[v.impact] ?? 1)
      }

      // Manual findings
      const manualFindings = this.manualResults
        .filter((r) => r.url === url)
        .flatMap((r) => r.findings)
      const passes = manualFindings.filter((f) => f.status === 'pass')
      const failures = manualFindings.filter((f) => f.status === 'fail')

      let manualDemerits = 0
      for (const f of failures) {
        manualDemerits += IMPACT_WEIGHTS[f.impact] ?? 1
      }

      const totalChecks = passes.length + failures.length + axeViolations.length
      const totalDemerits = axeDemerits + manualDemerits

      // Score: 100 minus demerits, floored at 0
      // Scale so a page with 1 critical violation scores ~90, several scores lower
      const score = totalChecks === 0 ? 100 : Math.max(0, Math.round(100 - (totalDemerits / Math.max(totalChecks, 1)) * 20))

      return {
        url,
        axeViolations: axeViolations.length,
        manualPasses: passes.length,
        manualFailures: failures.length,
        score,
        grade: gradeFromScore(score),
      }
    })
  }

  // -------------------------------------------------------------------------
  // HTML
  // -------------------------------------------------------------------------

  private buildHTML(
    violations: (A11yViolation & { urls: string[] })[],
    manual: (ManualFinding & { urls: string[] })[],
    scores: PageScore[],
  ): string {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    const totalElements = violations.reduce((s, v) => s + v.nodes.length, 0)
    const manualFails = manual.filter((f) => f.status === 'fail')
    const manualPasses = manual.filter((f) => f.status === 'pass')
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((s, p) => s + p.score, 0) / scores.length)
        : 100

    // --- Score cards ---
    const scoreCards = scores
      .map(
        (s) =>
          `<div class="score-card">
        <div class="grade grade-${s.grade.toLowerCase()}">${s.grade}</div>
        <div class="score-url">${esc(s.url.replace(/https?:\/\/[^/]+/, ''))}</div>
        <div class="score-detail">${s.score}/100 &middot; ${s.axeViolations} axe &middot; ${s.manualPasses}/${s.manualPasses + s.manualFailures} manual</div>
      </div>`,
      )
      .join('')

    // --- Axe violation cards ---
    let axeCards = ''
    let num = 0
    for (const v of violations) {
      num++
      const tags = (v.tags ?? [])
        .filter((t) => t.startsWith('wcag') || t === 'best-practice')
        .join(', ')
      const elements = v.nodes
        .map((n, i) => {
          const html = n.html.length > 200 ? n.html.slice(0, 200) + '...' : n.html
          const selector = n.target?.length ? esc(n.target.join(' > ')) : ''
          const fix = n.failureSummary
            ? `<div class="fix">${esc(n.failureSummary)}</div>`
            : ''
          return `<div class="node">
          <span class="num">${i + 1}</span>
          ${selector ? `<div class="sel"><strong>Selector:</strong> <code>${selector}</code></div>` : ''}
          <div><strong>HTML:</strong> <code>${esc(html)}</code></div>
          ${fix}
        </div>`
        })
        .join('')

      axeCards += `<details class="rule">
        <summary>
          <span class="idx">${num}</span>
          <span class="badge" style="background:${IMPACT_COLORS[v.impact]}">${v.impact}</span>
          <strong>${esc(v.id)}</strong> &mdash; ${esc(v.description)}
          <span class="cnt">${v.nodes.length} element${v.nodes.length !== 1 ? 's' : ''}</span>
        </summary>
        <div class="detail">
          <div class="meta">
            ${tags ? `<div><strong>WCAG:</strong> ${esc(tags)}</div>` : ''}
            <div><strong>Pages:</strong> ${v.urls.map((u) => esc(u)).join(', ')}</div>
            <div><a href="${esc(v.helpUrl)}">Documentation</a></div>
          </div>
          ${elements}
        </div>
      </details>`
    }

    // --- Manual finding cards ---
    let manualCards = ''
    let mnum = 0
    for (const f of manual) {
      mnum++
      const color = f.status === 'pass' ? STATUS_COLORS.pass : IMPACT_COLORS[f.impact]
      const icon = f.status === 'pass' ? '\u2705' : '\u274c'

      manualCards += `<details class="rule" ${f.status === 'fail' ? 'open' : ''}>
        <summary>
          <span class="idx">${mnum}</span>
          <span class="badge" style="background:${color}">${f.status === 'pass' ? 'pass' : f.impact}</span>
          <strong>${esc(f.rule)}</strong> &mdash; ${esc(f.description)}
          <span class="cnt">${icon} ${esc(f.category)}</span>
        </summary>
        <div class="detail">
          <div class="meta">
            ${f.selector ? `<div><strong>Selector:</strong> <code>${esc(f.selector)}</code></div>` : ''}
            ${f.details ? `<div><strong>Details:</strong> ${esc(f.details)}</div>` : ''}
            <div><strong>Pages:</strong> ${f.urls.map((u) => esc(u)).join(', ')}</div>
          </div>
        </div>
      </details>`
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Accessibility Report</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;max-width:1100px;margin:0 auto;padding:24px;background:#fafafa}
h1{margin-bottom:4px}
.sub{color:#555;margin-bottom:24px}
.stats{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}
.stat{background:#fff;border:1px solid #ddd;border-radius:8px;padding:14px 20px;min-width:100px}
.stat .n{font-size:2em;font-weight:700}
.stat .l{color:#555;font-size:.85em;text-transform:capitalize}
.scores{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}
.score-card{background:#fff;border:1px solid #ddd;border-radius:8px;padding:14px 20px;min-width:180px;display:flex;flex-direction:column;align-items:center;gap:4px}
.grade{font-size:2.5em;font-weight:800;line-height:1}
.grade-a{color:#2e7d32}.grade-b{color:#558b2f}.grade-c{color:#f9a825}.grade-d{color:#e65100}.grade-f{color:#d32f2f}
.score-url{font-size:.8em;color:#555;word-break:break-all;text-align:center}
.score-detail{font-size:.75em;color:#888}
h2{margin:28px 0 10px;border-bottom:2px solid #ddd;padding-bottom:6px}
.rule{background:#fff;border:1px solid #ddd;border-radius:8px;margin-bottom:6px}
.rule summary{cursor:pointer;padding:10px 14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;list-style:none}
.rule summary::-webkit-details-marker{display:none}
.rule summary::before{content:'\\25B6';font-size:.65em;transition:transform .2s;flex-shrink:0}
.rule[open] summary::before{transform:rotate(90deg)}
.rule summary:hover{background:#f9f9f9}
.idx{color:#888;font-size:.85em;min-width:1.5em}
.cnt{margin-left:auto;color:#888;font-size:.85em}
.badge{color:#fff;padding:2px 7px;border-radius:4px;font-size:.75em;font-weight:600;text-transform:uppercase}
.detail{padding:0 14px 14px}
.meta{padding:6px 0 10px;font-size:.9em;display:flex;flex-direction:column;gap:3px;border-bottom:1px solid #eee;margin-bottom:10px}
.node{padding:8px 10px;background:#fafafa;border:1px solid #eee;border-radius:4px;margin-bottom:6px;font-size:.85em}
.num{background:#e0e0e0;color:#555;font-size:.75em;font-weight:600;padding:1px 5px;border-radius:3px;margin-right:6px}
.sel{margin-bottom:3px}
.sel code,.node code{font-size:.85em;background:#f5f5f5;padding:1px 4px;border-radius:3px;word-break:break-all}
.fix{color:#2e7d32;background:#e8f5e9;padding:4px 8px;border-radius:3px;margin-top:4px;white-space:pre-line;font-size:.85em}
a{color:#1565c0}
footer{margin-top:32px;padding-top:12px;border-top:1px solid #ddd;color:#888;font-size:.85em}
</style>
</head>
<body>
<h1>Accessibility Report</h1>
<p class="sub">${scores.length} page(s) &middot; ${violations.length} axe rules &middot; ${totalElements} elements &middot; ${manualPasses.length + manualFails.length} manual checks &middot; ${new Date().toISOString().slice(0, 16).replace('T', ' ')}</p>

<div class="stats">
  <div class="stat"><div class="n">${avgScore}</div><div class="l">avg score</div></div>
  <div class="stat"><div class="n">${violations.length}</div><div class="l">axe rules</div></div>
  <div class="stat"><div class="n" style="color:${STATUS_COLORS.pass}">${manualPasses.length}</div><div class="l">manual pass</div></div>
  <div class="stat"><div class="n" style="color:${STATUS_COLORS.fail}">${manualFails.length}</div><div class="l">manual fail</div></div>
</div>

${scores.length > 0 ? `<h2>Page Scores</h2><div class="scores">${scoreCards}</div>` : ''}

${violations.length > 0 ? `<h2>Axe Violations (${violations.length})</h2>${axeCards}` : ''}

${manual.length > 0 ? `<h2>Manual Checks (${manual.length})</h2>${manualCards}` : ''}

${violations.length === 0 && manual.length === 0 ? '<p>No violations or findings.</p>' : ''}

<footer>Pages: ${[...new Set([...this.axeResults.map((r) => r.url), ...this.manualResults.map((r) => r.url)])].map((u) => esc(u)).join(' &middot; ')}</footer>
</body>
</html>`
  }
}

export default A11yReporter
