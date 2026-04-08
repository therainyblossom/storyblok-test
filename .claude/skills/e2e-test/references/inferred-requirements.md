# Inferred Requirements Checklist

Every component in a production website is expected to meet these, even if nobody wrote them down.

## Functional
- Every interactive element does what it visually promises
- State changes reflected in UI immediately
- URL state and UI state in sync (deep-linkable, survives refresh, browser back/forward)
- Form submissions validate and show feedback
- Empty states handled (0 results, missing image, no content)
- Loading states exist for async operations

## Responsive
- Layout works at 375px, 768px, 1280px without overflow
- Font sizes scale across breakpoints
- Touch targets ≥ 44x44px on mobile
- Mobile-specific UI patterns work
- Images responsive (no overflow, correct aspect ratios)

## Accessibility (WCAG 2.1 AA)
- All interactive elements keyboard-reachable and operable
- Focus visible on all interactive elements
- Focus management on open/close transitions
- ARIA roles correct for complex widgets
- Heading hierarchy sequential (no skips)
- Images have alt text
- Color contrast ≥ 4.5:1 for text

## Semantic HTML
- `<a>` for navigation, `<button>` for actions
- Correct heading levels for hierarchy
- Landmark elements present (header, nav, main, footer)
- Lists use `<ul>/<ol>`, tables use `<table>`

## i18n
- Page renders in default + secondary locale without breakage
- UI labels translated
- Long translated words don't overflow
- Locale-prefixed URLs work

## URL & Navigation
- Direct navigation with params applies them
- User actions update the URL
- Invalid params don't crash
- Browser back/forward preserves state
- Entry-path params don't conflict with user actions

## Content Resilience
- Works when CMS fields are empty/optional
- Doesn't assume specific counts, titles, or content
- Handles 1, 2, many, and 0 items
