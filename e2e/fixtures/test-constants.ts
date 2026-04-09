/**
 * Test constants — single source of truth for all CMS-dependent values.
 *
 * Rules:
 * - NEVER hardcode CMS content in test files — import from here
 * - Use >= for counts, not === (content may grow)
 * - Use titleContains/textContains for partial matches (editors change wording)
 */

// ---------------------------------------------------------------------------
// Locales (from nuxt.config.ts i18n)
// ---------------------------------------------------------------------------

export const LOCALES = {
  default: 'en',
  secondary: 'de',
  all: ['en', 'de'],
} as const

// ---------------------------------------------------------------------------
// Pages — known URLs that reliably exist in Storyblok
// ---------------------------------------------------------------------------

export const PAGES = {
  home: {
    slug: '',
    slugSecondary: `${LOCALES.secondary}`,
    expectedH1Contains: 'Education',
  },

  about: {
    slug: 'about',
    expectedH1Contains: 'About',
  },

  services: {
    slug: 'services',
    expectedH1Contains: 'Services',
  },

  blog: {
    slug: 'blog',
    expectedH1Contains: 'Blog',
  },

  contact: {
    slug: 'contact',
    expectedH1Contains: 'Get in Touch',
  },
} as const

// ---------------------------------------------------------------------------
// Navigation — CMS-driven, nav items loaded from Storyblok config
// ---------------------------------------------------------------------------

export const NAV = {
  headerSelector: '#default-header',
  mobileMenuSelector: '.md\\:hidden.fixed',
} as const

// ---------------------------------------------------------------------------
// Breakpoints — standard responsive test widths
// ---------------------------------------------------------------------------

export const BREAKPOINTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const
