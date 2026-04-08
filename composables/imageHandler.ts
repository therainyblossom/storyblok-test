import { computed } from 'vue'
import { useImage } from '#imports'

export function useImageHandler(imgUrl: string | null | undefined, isExternal: boolean = false) {
  const img = useImage()

  const optimizedUrl = computed(() => {
    if (imgUrl) {
      return isExternal
        ? imgUrl // Just return the raw URL, no Nuxt Image processing
        : img(imgUrl, { provider: 'storyblok' })
    }
    return null
  })

  return { optimizedUrl }
}
