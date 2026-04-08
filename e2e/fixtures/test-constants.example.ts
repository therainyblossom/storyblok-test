/**
 * REAL-WORLD EXAMPLE — TecAlliance website (Storyblok CMS, Nuxt 3)
 *
 * This shows how a production project fills in the test-constants template.
 * Copy test-constants.ts and replace the placeholder values with your own.
 *
 * Key patterns demonstrated:
 * - Nested locale structure with region prefix (eu/en, eu/de, eu/fr)
 * - CMS datasource mappings for filters (exact option text from Storyblok)
 * - Optional fields with comments explaining when they might be absent
 * - Partial title matching (editors change wording, so use titleContains)
 * - Minimum counts with >= (content grows over time)
 */

// ---------------------------------------------------------------------------
// Locales — region + language prefix structure
// ---------------------------------------------------------------------------

export const LOCALES = {
  /** Default region/language combo used in most tests */
  default: 'eu/en',
  secondary: 'eu/de',
  tertiary: 'eu/fr',
  all: ['eu/en', 'eu/de', 'eu/fr'],

  /** Region codes (first path segment) */
  regions: ['eu', 'sa'] as const,

  /** Language codes (second path segment) */
  languages: ['en', 'de', 'fr'] as const,
} as const

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export const PAGES = {
  home: {
    slug: `${LOCALES.default}`,
    slugSecondary: `${LOCALES.secondary}`,
  },

  /** Products landing page — has filter bar, product cards, result count */
  products: {
    slug: `${LOCALES.default}/products/landing`,
    slugDe: `${LOCALES.secondary}/products/landing`,
    slugFr: `${LOCALES.tertiary}/products/landing`,
    /** Editors add cards regularly — use >= not === */
    minTotalCards: 30,
  },

  /** A solution page — has accordion FAQ section */
  solutionTecdoc: {
    slug: `${LOCALES.default}/solutions/tecdoc`,
    /** This page has a WebsiteAccordion component with expand_first_card */
    accordion: {
      minItems: 5,
    },
  },
} as const

// ---------------------------------------------------------------------------
// Product cards — known items that reliably exist on staging
// ---------------------------------------------------------------------------

export const KNOWN_CARDS = {
  /** A card that always appears in the unfiltered listing */
  primary: {
    slug: 'autotecnic-products',
    /** Partial match — don't assert exact title, editors rename cards */
    titleContains: 'autotecnic',
  },

  /** A second card for highlight, entry-path, and multi-card tests */
  secondary: {
    slug: 'vio-data',
    titleContains: 'vio',
  },
} as const

// ---------------------------------------------------------------------------
// Filters — values from CMS datasources (must match exact option text)
// ---------------------------------------------------------------------------

/**
 * These strings come from Storyblok datasources. When a datasource entry
 * is renamed in the CMS, update the value here — not in every test file.
 */
export const FILTERS = {
  /** Customer type dropdown options (datasource: website-filter-customer-type) */
  customerTypes: {
    workshopChains: 'Workshop Chains',
    distributors: 'Distributors',
    partsManufacturers: 'Parts Manufacturers',
    ecommerce: 'E-commerce & Marketplace',
  },

  /** Customer interest dropdown options (datasource: website-filter-customer-interest) */
  customerInterests: {
    searchVehicles: 'Search vehicles',
    launchOnlineShop: 'Launch your online shop',
  },

  /** Solution area URL slugs (used in ?solutionAreas= query param) */
  solutionAreas: {
    dataManagement: 'data-management',
  },
} as const

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export const NAV = {
  /** Desktop main navigation items (visible at >= 768px) */
  mainMenuItems: ['Solutions', 'Partners', 'Company', 'Resources', 'Contact'],

  /** Meta navigation items (top bar, visible at >= 768px) */
  metaNavItems: ['TecAlliance Shop', 'Support', 'Career'],
} as const

// ---------------------------------------------------------------------------
// Breakpoints
// ---------------------------------------------------------------------------

export const BREAKPOINTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const

// ---------------------------------------------------------------------------
// Backward-compatible flat export
// ---------------------------------------------------------------------------

export const TEST_DATA = {
  productsPage: PAGES.products.slug,
  productsPageDe: PAGES.products.slugDe,
  productsPageFr: PAGES.products.slugFr,
  knownCard: KNOWN_CARDS.primary,
  secondCard: KNOWN_CARDS.secondary,
  customerTypes: FILTERS.customerTypes,
  customerInterests: FILTERS.customerInterests,
  solutionAreas: FILTERS.solutionAreas,
  minTotalCards: PAGES.products.minTotalCards,
  accordionPage: {
    slug: PAGES.solutionTecdoc.slug,
    minItems: PAGES.solutionTecdoc.accordion.minItems,
  },
} as const
