# Content Quality Rules

Rules for CMS content that the code allows but the site shouldn't show. These are editor guidelines enforced by automated checks.

**Customize these thresholds for your project.** A news site has different image rules than a product catalog.

## Images

| Rule | Default Threshold | Severity |
|------|-------------------|----------|
| Natural width > 2x display width | 2x ratio | Major — wastes bandwidth |
| Natural width > 3x display width | 3x ratio | Critical — likely unoptimized upload |
| Missing `alt` attribute | n/a | Critical — accessibility violation |
| Generic alt text | See patterns below | Major — useless to screen readers |
| Broken image (404 or not loaded) | n/a | Critical — visible to users |
| Missing `width`/`height` attributes | n/a | Minor — causes layout shift |
| Below-fold without `loading="lazy"` | n/a | Minor — slows initial load |

### Generic Alt Text Patterns

These patterns indicate the editor didn't write meaningful alt text:

- `image`, `img`, `photo`, `picture`, `untitled`
- `screenshot...` (camera/OS default)
- `DSC_0001`, `IMG_20240315` (camera filename)
- `hero.jpg`, `banner.png` (filename used as alt)
- Single character or number
- Same alt text on 3+ images on the same page (copy-paste)

### What Good Alt Text Looks Like

- **Informative**: "Team members collaborating in the Berlin office"
- **Functional**: "Download our annual report (PDF, 2.4MB)"
- **Decorative**: `alt=""` (empty, not missing) — for purely visual elements

## Text Content

| Rule | Default Threshold | Severity |
|------|-------------------|----------|
| Heading overflow | `scrollWidth > clientWidth` | Major — breaks layout |
| Card heading > 100 chars | 100 characters | Minor — may break grid |
| Page title > 60 chars | 60 characters (SEO) | Minor |
| Visible placeholder text | See patterns below | Critical — draft content leaked |
| Empty visible container | No text, no images | Major — confusing blank space |

### Placeholder Patterns

- `Lorem ipsum`, `dolor sit amet`
- `TBD`, `TODO`, `FIXME`
- `placeholder`, `test content`, `test data`
- `Coming soon` (may be intentional — flag for review, not auto-fail)
- `[insert X here]`, `{REPLACE}`

## Media

| Rule | Default Threshold | Severity |
|------|-------------------|----------|
| Video without `poster` | n/a | Minor — shows black until play |
| Iframe without `title` | n/a | Major — accessibility violation |
| Broken embed (404 / blocked) | n/a | Critical — visible to users |
| Auto-playing video without `muted` | n/a | Major — unexpected audio |

## CMS Field Completeness

| Rule | Severity | Notes |
|------|----------|-------|
| Card/teaser without heading | Major | Incomplete content entry |
| Link without text or image | Critical | Inaccessible, invisible to some users |
| Image-only link without alt | Critical | No link text for screen readers |
| CTA button with generic text | Minor | "Click here", "Read more" without context |

### Generic CTA Patterns

Flag buttons/links with text matching:
- `Click here`, `Read more`, `Learn more`, `More info`, `Details`
- These need context: "Read more about accessibility testing" not just "Read more"

## Adjusting Thresholds

| Project Type | Image Max Ratio | Heading Max Chars | Notes |
|-------------|-----------------|-------------------|-------|
| Marketing site | 2x | 80 | Tight layouts, brand consistency |
| Blog/news | 2x | 120 | Longer headlines acceptable |
| E-commerce | 1.5x | 60 | Product images must be optimized |
| Documentation | 3x | 150 | Screenshots may be large, headings descriptive |

## Who Fixes What

| Issue Type | Fixed By | How |
|-----------|----------|-----|
| Oversized images | Content editor | Re-upload at correct dimensions, or enable CMS auto-resize |
| Generic alt text | Content editor | Write descriptive alt text |
| Placeholder text | Content editor | Replace with real content |
| Text overflow | Content editor + developer | Editor shortens text, developer adds `text-overflow: ellipsis` |
| Missing CMS fields | Content editor | Complete all required fields |
| Broken embeds | Content editor | Update embed URL |
| Missing `width`/`height` | Developer | Add attributes to `<img>` template |
| Missing `loading="lazy"` | Developer | Add to below-fold images |
