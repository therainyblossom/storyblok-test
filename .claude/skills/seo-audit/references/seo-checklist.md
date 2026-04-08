# SEO Checklist

Quick reference for pass/fail criteria. Check every item for each page.

## Per-Page (Critical)

- [ ] `<title>` — 30-60 chars, unique across site, includes primary keyword
- [ ] `<meta name="description">` — 120-160 chars, unique, summarizes page content
- [ ] `<link rel="canonical">` — present, absolute URL, points to self (or preferred version)
- [ ] One `<h1>` per page, matches page topic
- [ ] No skipped heading levels (h1 → h3 without h2)

## Per-Page (Important)

- [ ] `og:title` — present, matches or extends `<title>`
- [ ] `og:description` — present, matches or extends meta description
- [ ] `og:image` — present, absolute URL, image exists (not 404)
- [ ] `og:url` — present, matches canonical
- [ ] `twitter:card` — present (`summary` or `summary_large_image`)
- [ ] All `<img>` have `alt` attribute (empty `alt=""` acceptable for decorative)
- [ ] All `<img>` have `width` and `height` attributes (prevents layout shift)

## Per-Page (Nice to Have)

- [ ] `og:type` — present (e.g., `website`, `article`)
- [ ] `twitter:title` and `twitter:description` — present
- [ ] JSON-LD structured data — valid JSON, has `@type`, matches page content
- [ ] `hreflang` tags for each supported locale (multi-language sites)

## Site-Level

- [ ] `robots.txt` returns 200, does not block important paths
- [ ] `robots.txt` references sitemap URL
- [ ] `sitemap.xml` returns 200, valid XML, contains all important URLs
- [ ] Sitemap URLs are absolute (not relative)
- [ ] HTTP requests redirect to HTTPS (301)
- [ ] No mixed content (HTTP resources on HTTPS pages)

## Cross-Page

- [ ] No duplicate `<title>` values across pages
- [ ] No duplicate `<meta description>` values across pages
- [ ] Secondary locale pages have translated titles (not English fallback)
- [ ] Canonical URLs don't create loops or point to 404s

## Severity Guide

| Severity | Examples |
|----------|----------|
| Critical | Missing title, missing h1, robots.txt blocks site |
| Major | Missing meta description, missing canonical, duplicate titles |
| Minor | Missing OG image, title too long, missing image dimensions |
| Info | Missing twitter:description, missing JSON-LD |
