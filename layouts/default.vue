<script lang="ts" setup>
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import { useStoryblokStore } from '~/stores/storyblok'
import { useI18n } from 'vue-i18n'

const storyblokStore = useStoryblokStore()
const { locale } = useI18n()

const updateSiteConfig = async (newLocale: string) => {
  await storyblokStore.fetchSiteConfig(newLocale)
}

// Watch for language changes and update the site config
watch(locale, (newLocale) => {
  void updateSiteConfig(newLocale)
})

// Initialize site config on first load
await storyblokStore.fetchSiteConfig(locale.value)

// Use the config from the store
const configContent = computed(() => storyblokStore.siteConfig)
</script>

<template>
  <div class="dark:bg-gray-900">
    <GtmNoScript />
    <NuxtLoadingIndicator :height="4" color="#e60012" />
    <div class="flex flex-col min-h-screen overflow-x-hidden max-w-screen-xl mx-auto">
      <Header :config="configContent" />
      <div v-if="configContent?.content?.breadcrumb" class="mx-auto container px-4 py-8">
        <BreadCrumbs />
      </div>
      <main class="flex-grow container mx-auto">
        <slot />
      </main>
      <Footer :config="configContent" />
    </div>
  </div>
</template>
