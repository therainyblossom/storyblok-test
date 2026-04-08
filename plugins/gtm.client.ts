declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const gtmId = config.public.GTM_ID
  const serverUrl = config.public.GTM_SERVER_URL

  if (!gtmId || !serverUrl) {
    return
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  })

  const script = document.createElement('script')
  script.async = true
  script.src = `${serverUrl}/gtm.js?id=${gtmId}`
  document.head.appendChild(script)
})
