import { test, expect } from '@playwright/test'
import path from 'path'
import { waitForDomStable, exposeHiddenContent, filterFalseContrastViolations } from '../accessibility'

const TEST_PAGE = `file://${path.join(__dirname, 'test-page.html')}`

test.describe('waitForDomStable', () => {
  test.use({ baseURL: undefined })

  test('resolves when DOM is idle', async ({ page }) => {
    await page.goto(TEST_PAGE)
    await waitForDomStable(page, 3000, 200)
    // If we get here without timeout, it resolved
  })
})

test.describe('exposeHiddenContent', () => {
  test.use({ baseURL: undefined })

  test('opens details elements (safe mode)', async ({ page }) => {
    await page.goto(TEST_PAGE)

    // Verify details is closed
    const openBefore = await page.locator('details[open]').count()
    expect(openBefore).toBe(0)

    await exposeHiddenContent(page)

    // Now it should be open
    const openAfter = await page.locator('details[open]').count()
    expect(openAfter).toBe(1)
  })

  test('does not click accordions in safe mode', async ({ page }) => {
    await page.goto(TEST_PAGE)

    // Add a fake accordion
    await page.evaluate(() => {
      const btn = document.createElement('button')
      btn.setAttribute('aria-expanded', 'false')
      btn.textContent = 'Accordion'
      btn.addEventListener('click', () => btn.setAttribute('aria-expanded', 'true'))
      document.body.appendChild(btn)
    })

    await exposeHiddenContent(page)

    // Accordion should still be collapsed (safe mode doesn't click)
    const expanded = await page.locator('button[aria-expanded="true"]').count()
    expect(expanded).toBe(0)
  })

  test('clicks accordions in aggressive mode', async ({ page }) => {
    await page.goto(TEST_PAGE)

    await page.evaluate(() => {
      const btn = document.createElement('button')
      btn.setAttribute('aria-expanded', 'false')
      btn.textContent = 'Accordion'
      btn.addEventListener('click', () => btn.setAttribute('aria-expanded', 'true'))
      document.body.appendChild(btn)
    })

    await exposeHiddenContent(page, { aggressive: true })

    const expanded = await page.locator('button[aria-expanded="true"]').count()
    expect(expanded).toBe(1)
  })
})

test.describe('filterFalseContrastViolations', () => {
  test.use({ baseURL: undefined })

  test('removes passing nodes from violations', async ({ page }) => {
    await page.goto(TEST_PAGE)

    // Add a high-contrast element
    await page.evaluate(() => {
      const el = document.createElement('p')
      el.id = 'good-contrast'
      el.textContent = 'Black on white'
      el.style.color = '#000000'
      el.style.backgroundColor = '#ffffff'
      document.body.appendChild(el)
    })

    // Simulate a false violation flagging #good-contrast
    const violations = [{
      id: 'color-contrast',
      nodes: [{ target: ['#good-contrast'] }],
    }]

    await filterFalseContrastViolations(page, violations)

    // The node should be removed since it actually passes
    expect(violations[0].nodes).toHaveLength(0)
  })

  test('keeps genuinely failing nodes', async ({ page }) => {
    await page.goto(TEST_PAGE)

    // Add a low-contrast element
    await page.evaluate(() => {
      const el = document.createElement('p')
      el.id = 'bad-contrast'
      el.textContent = 'Light gray on white'
      el.style.color = '#cccccc'
      el.style.backgroundColor = '#ffffff'
      document.body.appendChild(el)
    })

    const violations = [{
      id: 'color-contrast',
      nodes: [{ target: ['#bad-contrast'] }],
    }]

    await filterFalseContrastViolations(page, violations)

    // The node should remain since it genuinely fails
    expect(violations[0].nodes).toHaveLength(1)
  })

  test('ignores non-contrast violations', async ({ page }) => {
    await page.goto(TEST_PAGE)

    const violations = [{
      id: 'image-alt',
      nodes: [{ target: ['img'] }],
    }]

    await filterFalseContrastViolations(page, violations)

    // Non-contrast violations should be untouched
    expect(violations[0].nodes).toHaveLength(1)
  })
})
