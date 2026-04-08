# Known Bug Patterns

Add bugs found in your project here. When auditing any feature, check these first — they recur.

## Template

### {Pattern Name}
**What happens**: {description}
**Where to look**: {files/code patterns}
**How to detect**: {what to check in tests}

## Examples (remove or replace with your own)

### Entry-path param stacking
Navigation links set URL params. The filter bar merges into existing query instead of clearing entry-path params, creating compound URLs with AND-logic dead ends.

### Invalid params → silent 0 results
Validation function exists but is never called. Invalid slugs pass through to filter logic and match nothing.

### Single-select dropdown on multi-value param
URL supports comma-separated values, but dropdown is single-select. Selecting replaces previous value.

### Fixed font sizes
Components use fixed size instead of responsive scale. Font doesn't change across breakpoints.

### Wrong semantic heading level
Card/item titles use wrong `<hN>` tag for their position in the page hierarchy.

### Default tab always index 0
Expandable components with tabs always select first tab regardless of navigation context.
