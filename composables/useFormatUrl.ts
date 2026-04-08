export const useFormatUrl = (url: string) => {
  if (!url) return url
  
  // Get folder prefix from config (typically "dev")
  const config = useRuntimeConfig()
  const folderSpace = config.public.FOLDER_SPACE
  
  // Get available locales from i18n config
  const i18n = useNuxtApp().$i18n
  const availableLocales = i18n.locales.value.map((l: any) => l.code)
  
  // Always get the current locale to ensure it's up to date
  const { locale } = useI18n()
  
  let formattedUrl = url
  
  // First check if the URL has a locale prefix
  let hasLocalePrefix = false
  let localePrefix = ''
  
  for (const loc of availableLocales) {
    // Check for patterns like "/fr/..." or "fr/..."
    if (formattedUrl.startsWith(`/${loc}/`)) {
      hasLocalePrefix = true
      localePrefix = `/${loc}`
      formattedUrl = formattedUrl.substring(loc.length + 1) // +1 for the slash
      break
    } else if (formattedUrl.startsWith(`${loc}/`)) {
      hasLocalePrefix = true
      localePrefix = `/${loc}`
      formattedUrl = formattedUrl.substring(loc.length)
      break
    }
  }
  
  // Now remove the folder prefix
  if (folderSpace) {
    formattedUrl = formattedUrl.replace(`/${folderSpace}/`, '/')
    formattedUrl = formattedUrl.replace(`${folderSpace}/`, '')
  }
  
  // Ensure URL starts with a slash
  if (!formattedUrl.startsWith('/')) {
    formattedUrl = `/${formattedUrl}`
  }
  
  // Add back the locale prefix if it existed
  if (hasLocalePrefix) {
    formattedUrl = `${localePrefix}${formattedUrl}`
  } else if (locale.value && locale.value !== 'en') {
    // If no locale prefix was in the original URL, but we're in a non-default locale,
    // add the current locale prefix
    formattedUrl = `/${locale.value}${formattedUrl}`
  }
  
  return formattedUrl
}