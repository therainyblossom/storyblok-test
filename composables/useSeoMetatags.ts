import { useHead, useRoute, useRequestURL, useI18n } from '#imports'

type SeoMeta = {
  title?: string
  description?: string
  og_title?: string
  og_description?: string
  og_image?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
}

export function useSeoMetatags(seo: SeoMeta, fallbackTitle: string = '', fallbackDescription: string = '', noIndex: boolean) {
  const _route = useRoute()
  const { locale } = useI18n()
  const currentUrl = useRequestURL()
  const canonicalUrl = (() => {
    const url = new URL(currentUrl.href)
    return url.href
  })()
  
  const robotsContent = noIndex ? 'noindex,follow' : 'index,follow'
  
  useHead({
    title: seo?.title || fallbackTitle,
    meta: [
      { name: 'description', content: seo?.description || fallbackDescription },
      { property: 'og:title', content: seo?.og_title || seo?.title || fallbackTitle },
      {
        property: 'og:description',
        content: seo?.og_description || seo?.description || fallbackDescription
      },
      { property: 'og:image', content: seo?.og_image || '' },
      { name: 'twitter:title', content: seo?.twitter_title || seo?.title || fallbackTitle },
      {
        name: 'twitter:description',
            content: seo?.twitter_description || seo?.description || fallbackDescription
      },
      { name: 'twitter:image', content: seo?.twitter_image || '' },
        { name: 'robots', content: robotsContent }
      ],  
      link: [{ rel: 'canonical', href: canonicalUrl }],
      htmlAttrs: { lang: locale.value }
    })
  }
