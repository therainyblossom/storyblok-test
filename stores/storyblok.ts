import { defineStore } from 'pinia'
import type { TranslatedSlug } from '~/types/storyblok-extensions'

interface SiteConfig {
  [key: string]: unknown
}

export const useStoryblokStore = defineStore('storyblok', () => {
  // State
  const siteConfig = ref<SiteConfig>({})
  const translatedSlugs = ref<TranslatedSlug[]>([])
  const isLoading = ref(false)
  const route = useRoute()

  /**
   * Set the translated slugs for the current page
   */
  function setTranslatedSlugs(slugs: TranslatedSlug[]) {
    translatedSlugs.value = slugs
  }
  
  /**
   * Clear the translated slugs (e.g. when navigating to a different page)
   */
  function clearTranslatedSlugs() {
    translatedSlugs.value = []
  }
  
  /**
   * Fetch site configuration from Storyblok with the current language
   */
  async function fetchSiteConfig(locale: string) {
    isLoading.value = true

    try {
      const config = useRuntimeConfig()
      const folderSpace = config.public.FOLDER_SPACE
      
      const storyblokApi = useStoryblokApi()
      const storySlug = (folderSpace ? `${folderSpace}/` : '') + 'site-config'

      const { data } = await storyblokApi.get(`cdn/stories/${storySlug}`, {
        version: getVersion(),
        language: locale,
        resolve_links: 'url',
      })

      if (data?.story?.content)
        siteConfig.value = data.story.content
    } catch (error) {
      console.error('Failed to fetch site configuration:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Navigate to home page with the selected language
   */
  async function navigateToTranslatedPage(targetLocale: string) {
    const router = useRouter()
    
    console.log(`Switching language to ${targetLocale}, redirecting to home`)
    
    if (targetLocale === 'en') {
      return router.push('/')
    }
    
    return router.push(`/${targetLocale}`)
  }

  // Return all state and functions
  return {
    // State
    siteConfig,
    translatedSlugs,
    isLoading,
    
    // Actions
    setTranslatedSlugs,
    clearTranslatedSlugs,
    fetchSiteConfig,
    navigateToTranslatedPage
  }
})
