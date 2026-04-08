export default function getVersion() {
  const route = useRoute()
  const config = useRuntimeConfig()

  const isPreview = computed(
    () =>
      !!route.query._storyblok || window?.location.ancestorOrigins[0]?.includes('app.storyblok.com')
  )
  const isDevelopment =
    config.public.NODE_ENV === 'development' || config.public.NODE_ENV.toUpperCase() === 'DEV'

  return isPreview.value || isDevelopment ? 'draft' : 'published'
}
