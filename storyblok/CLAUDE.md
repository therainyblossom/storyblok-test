# Storyblok Component Rules

Every Vue file here renders a Storyblok CMS block via the `blok` prop.

## Required

- **Optional chaining on all blok fields**: `blok.link?.story?.full_slug`, never `blok.link.story`
- **Asset fields are objects**: access `.filename` and `.alt`, not the field directly
- **Multilink fields are objects**: access `.url`, `.cached_url`, `.story?.full_slug`, `.target`
- **Use `v-if` guards** before rendering fields that may be empty (images, links, nested bloks)
- **Use `<NuxtImg provider="storyblok">`** for images, not plain `<img>`
- **Use `<StoryblokComponent :blok="item">`** for nested bloks, not direct component imports

## Schema must match template

Each component has a schema in Storyblok (exported in `components.*.json`). Fields in the template must match schema field names exactly. If you add a field to the template, update the schema too.

Common mismatches to avoid:
- Template uses `blok.featuredIn` but schema has `featuredInText`
- Template uses `blok.url` as string but schema type is `multilink` (object)
- Template accesses `blok.link.target` without `?.` — crashes if link is empty

## Naming

- File: `PascalCase.vue` (e.g. `WebsiteTeaser.vue`)
- Schema: `kebab-case` (e.g. `website-teaser`)
- Conversion: `WebsiteTeaser` → `website-teaser`
