<script lang="ts" setup>
const config = useRuntimeConfig()

const gtmSrc = computed(() => {
  const gtmId = config.public.GTM_ID
  if (!gtmId) return null
  return `https://www.googletagmanager.com/ns.html?id=${gtmId}`
})
</script>

<template>
  <noscript v-if="gtmSrc">
    <iframe
      :src="gtmSrc"
      height="0"
      width="0"
      style="display: none; visibility: hidden"
      title="Google Tag Manager"
    />
  </noscript>
</template>

