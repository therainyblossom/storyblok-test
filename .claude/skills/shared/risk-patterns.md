# Risk Patterns — What to Test First

Common bug patterns in web applications, ranked by frequency. Check these first when analyzing any feature.

## Tier 1: Always Test

### URL Parameter Handling
- Params read, written, and updated correctly on submit
- Direct navigation with params applies them on load
- Invalid params don't crash or show silent empty state
- Browser back/forward preserves state
- Entry-path params (from navigation links) cleared on user interaction
- Comma-separated multi-values handled (not just first value)

### State Transitions
- Open/close/re-open preserves correct state
- Tab switching updates content and ARIA attributes
- Closing modal/dropdown returns focus to trigger
- Multiple expandable items don't interfere
- Default selection is context-appropriate (not always index 0)

### Filter Logic
- Selecting a filter narrows results
- "All" / reset returns to unfiltered state
- Filters combine correctly (AND across types, OR within)
- Cascade: parent selection narrows child options
- 0 results shows message, not blank
- Result count updates after interaction

### Accessibility (WCAG 2.1 AA)
- axe-core scan passes — use `checkA11y()` fixture on every page
- Headings: one h1, no skipped levels — use `assertHeadingHierarchy(page)`
- Keyboard: all interactive elements reachable via Tab, logical focus order
- Focus management: modal/dialog traps focus, Escape closes, focus returns to trigger — use `testModalFocusTrap()`
- ARIA: `aria-expanded`, `aria-selected`, `aria-controls` match visible state
- Images have meaningful `alt` text (or `alt=""` + `aria-hidden` for decorative)
- Form inputs have associated `<label>` or `aria-label`
- Contrast: text ≥ 4.5:1, large text ≥ 3:1 — use `checkA11y({ filterContrast: true })` to remove false positives
- Hidden content in `<details>`: use `checkA11y({ prepare: true })`
- Hidden content in accordions/tabs/modals: use `checkA11y({ prepare: true, prepareAggressive: true })` (may cause side effects)

## Tier 2: Test for User-Facing Features

### Responsive Layout (375px / 768px / 1280px)
- No content overflow or clipping — use `BasePage.testAtBreakpoint(375, 812, fn)`
- Font sizes scale (not fixed across viewports)
- Touch targets ≥ 44x44px on mobile
- Mobile-specific UI works (dropdowns, "Show more", stacking)
- Hidden elements appear at correct breakpoint

### Semantic HTML
- `<a>` for navigation, `<button>` for actions
- No `<div onclick>` patterns
- Links have `href`, buttons have clear actions
- Landmarks: `header`, `nav`, `main`, `footer` present

### Internationalization
- Page loads in default + secondary locale
- Labels, buttons, result text translated
- Long translated words don't overflow
- Locale-prefixed URLs work

## Tier 3: Test for Interactive Features

### Keyboard & Focus (deep testing)
- Tab order matches visual order — use `testTabNavigation()` for tablists
- Arrow keys in tablists and listboxes — use `testDropdownKeyboard()`
- Escape closes dropdowns/modals, focus returns to trigger
- Focus doesn't get lost to `<body>` after route change (SPA)
- Skip-to-content link works and is visible on focus
- No keyboard traps (can always Tab out of any widget)

### Forms & State
- Form doesn't reset after successful submission (values persist)
- Validation state persists across navigations (error messages linger)
- Cascading dropdowns: child select doesn't update when parent changes
- Double submit: clicking submit twice creates duplicate entries
- Required field errors clear when user starts typing

### Dates & Timezones
- Dates render in server timezone instead of user timezone
- Date formatting doesn't match locale (US vs EU format)
- Relative dates ("2 hours ago") break near midnight or DST transitions

### Edge Cases
- 0 items: message shown, no blank space
- 1 item: may have special behavior (auto-expand)
- 2 items: boundary for "related items" sections
- 100+ items: pagination, performance
- Empty CMS fields: graceful fallback

### Content Stability
- Tests use constants, not hardcoded CMS strings
- Assertions check structure (exists, visible) not exact text
- Counts use `>=` not `===`

## Quick Checklist

- [ ] Read the component source code
- [ ] Read the business logic (composables/hooks)
- [ ] Inspect the live page DOM
- [ ] Identify the state machine
- [ ] Check URL param handling
- [ ] Check filter/search logic
- [ ] Test at 375px + 1280px
- [ ] Test in default + secondary locale
- [ ] Test keyboard (Tab, Enter, Escape, Arrows)
- [ ] Verify heading hierarchy (`assertHeadingHierarchy`)
- [ ] Run `checkA11y()` on page
- [ ] Use test constants, not hardcoded values
