#!/usr/bin/env node
/**
 * Audit test constants against live staging.
 *
 * Customize the CHECKS array below for your project.
 * Run from your frontend directory where @playwright/test is installed.
 *
 * Usage: node audit-constants.js
 */
const { chromium } = require(require.resolve('@playwright/test', { paths: [process.cwd()] }))

// ===== CUSTOMIZE THESE =====
const STAGING = process.env.PLAYWRIGHT_BASE_URL || '{{STAGING_URL}}'
const AUTH = {
  username: process.env.PLAYWRIGHT_BASIC_AUTH_USER || '{{AUTH_USER}}',
  password: process.env.PLAYWRIGHT_BASIC_AUTH_PASS || '{{AUTH_PASS}}',
}

// Define checks: each is a { name, check(page) => boolean } pair
const CHECKS = [
  {
    name: 'Main page loads',
    check: async (page) => {
      const res = await page.goto(`${STAGING}/{{DEFAULT_LOCALE}}/your-page`, { waitUntil: 'networkidle' })
      return res.status() === 200
    },
  },
  // Add more checks for your project:
  // { name: 'Known item exists', check: async (page) => { ... } },
  // { name: 'Filter option present', check: async (page) => { ... } },
]
// ============================

async function audit() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    httpCredentials: AUTH,
  })
  const page = await ctx.newPage()

  let ok = 0, stale = 0

  console.log('\n=== Auditing test constants ===\n')

  for (const { name, check } of CHECKS) {
    try {
      const pass = await check(page)
      console.log(`${pass ? '✓' : '✘'} ${name}`)
      pass ? ok++ : stale++
    } catch (err) {
      console.log(`✘ ${name} — ${err.message}`)
      stale++
    }
  }

  console.log(`\n=== ${ok} OK, ${stale} STALE ===`)
  await browser.close()
  process.exit(stale > 0 ? 1 : 0)
}

audit().catch((err) => {
  console.error('Audit failed:', err.message)
  process.exit(2)
})
