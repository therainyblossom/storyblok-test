# Editor Patterns — CMS Components

Standard patterns for CMS-driven components. Use as a checklist when extracting requirements.

## Field Type Implications

| CMS Field Type | Requirement to Check |
|----------------|---------------------|
| Text | Max length? Translatable? |
| Rich text | Which formatting allowed? Translatable? |
| Asset/image | Required? Dimensions? Alt text? |
| Single-select | Options from datasource? Fallback? |
| Multi-select | Source? How are values used in filters? |
| Link | Internal/external? New tab? |
| Nested blocks | Whitelist? Min/max count? |

## Standard NFRs (always apply)

- **Responsive**: 375px / 768px / 1280px, touch targets ≥ 44px
- **i18n**: All user-facing text translatable, locale routing correct
- **A11y**: Keyboard nav, ARIA roles, heading hierarchy, contrast
- **SEO**: Correct headings, alt text, landmarks
- **Empty state**: Graceful fallback when content is missing

## Checklist for New Component

- [ ] Fields defined with correct types
- [ ] Translatable fields marked
- [ ] Renders at all 3 breakpoints
- [ ] Keyboard navigable
- [ ] ARIA roles assigned
- [ ] Heading level correct
- [ ] Empty state handled
- [ ] Correct semantic tags (a vs button)
- [ ] Images have alt text
