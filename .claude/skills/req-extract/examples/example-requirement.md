# Example: Filter Bar Requirement

## FR-012: Filter Bar Clears Entry-Path Params on Submit

**Priority**: Must
**Description**: Submitting the inline filter bar clears pre-existing entry-path URL parameters (solution, family, highlight).

**Acceptance Criteria**:
- [ ] Given URL has `?solution=X&highlight=Y`, when user selects interest and clicks Submit, then URL becomes `?interest=Z` (solution and highlight removed)
- [ ] Given URL has `?family=X`, when user submits customer type, then URL becomes `?customer=Y` (family removed)
- [ ] After clearing entry-path params, result count is > 0 (no dead ends)

**Edge Cases**:
- Submit without changing selection → still clears entry-path params
- Submit with "All" in both dropdowns → clears all params

**Test Stub**:
```typescript
test('FR-012: filter bar clears entry-path params', async ({ page }) => {
  // Given: entry-path params from navigation
  await page.goto('/page?solution=x&highlight=y')
  // When: user selects interest and submits
  // Then: entry-path params gone
  expect(page.url()).not.toContain('solution=')
  expect(page.url()).not.toContain('highlight=')
})
```
