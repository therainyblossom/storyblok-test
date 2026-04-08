// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  ssr: false,
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'Education Storyblok Sunzinet',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        {
          name: 'description',
          content: 'Education Storyblok Sunzinet'
        },

        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Yazaki' },
        {
          property: 'og:description',
          content: 'Education Storyblok Sunzinet'
        },
        { property: 'og:site_name', content: 'Yazaki' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Yazaki' },
        {
          name: 'twitter:description',
          content: 'Education Storyblok Sunzinet'
        }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      script: [
        {
          src: 'https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/datepicker.min.js'
        },
        {
          src: 'https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.js'
        }
      ]
    }
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: true,
      cssMinify: true,
      minify: 'terser',
      sourcemap: false,
      terserOptions: {
        compress: {
          drop_console: process.env.NUXT_PUBLIC_NODE_ENV === 'production',
          drop_debugger: process.env.NUXT_PUBLIC_NODE_ENV === 'production'
        }
      }
    },
    optimizeDeps: {
      include: ['vue', 'vue-router']
    },
    css: {
      devSourcemap: process.env.NUXT_PUBLIC_NODE_ENV !== 'production'
    }
  },
  css: ['~/assets/css/main.css'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'de', iso: 'de-DE', name: 'Deutsch', file: 'de.json' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    defaultLocale: 'en',
    strategy: 'prefix_except_default'
  },
  modules: [
    [
      '@storyblok/nuxt',
      {
        accessToken: process.env.NUXT_PUBLIC_STORYBLOK_ACCESS_TOKEN,
        bridge: true,
        apiOptions: {
          region: 'eu'
        }
      }
    ],
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'nuxt-swiper',
    '@kgierke/nuxt-basic-auth',
    '@vueuse/nuxt',
    'nuxt-seo-utils'
  ],
  nitro: {
    preset: 'github-pages',
    compressPublicAssets: {
      gzip: true,
      brotli: true
    },
    minify: true,
    timing: false
  },
  image: {
    provider: 'storyblok',
    quality: 80,
    format: ['webp'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    },
    preload: true,
    storyblok: {
      baseURL: 'https://a.storyblok.com'
    }
  },
  basicAuth: {
    enabled: false,
    users: [
      {
        username: 'sunzinet',
        password: process.env.NUXT_AUTH_PASSWORD || 'preview'
      }
    ],
    allowedRoutes: ['/api/health', 'http://localhost:3000/.*']
  },
  runtimeConfig: {
    AUTH_TOKEN: '',
    AUTH_PASSWORD: '',
    AUTH_ENABLED: '',
    public: {
      NODE_ENV: '',
      STORYBLOK_ACCESS_TOKEN: '',
      SPACE_ID: '',
      FOLDER_SPACE: '',
      GTM_ID: '',
      GTM_SERVER_URL: ''
    }
  }
})

