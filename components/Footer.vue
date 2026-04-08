<script setup lang="ts">
import { NuxtImg } from '#components'
defineProps({
  config: {
    type: Object,
    required: true
  }
})


const { isActiveLink } = useActiveLink()
</script>

<template>
  <footer class="bg-white dark:bg-gray-900">
    <div class="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
      <div class="md:flex md:justify-between">
        <div v-if="config.footer_logo" class="mb-6 md:mb-0">
          <NuxtLink to="/" class="flex items-center">
            <NuxtImg
              width="60"
              height="60"
              :src="config.footer_logo.filename"
              :alt="config.footer_logo.alt"
              class="mr-3"
            />
          </NuxtLink>
        </div>

        <div class="flex gap-8 sm:gap-6">
          <ul
            v-for="inBlok in config.footer_navigation"
            :key="inBlok._uid"
            class="text-gray-500 dark:text-white font-medium px-2"
          >
            <div class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
              {{ inBlok.title }}
            </div>
            <template v-for="link in inBlok.nav_items" :key="link._uid">
              <li class="mb-4">
                <NuxtLink
                  :to="useFormatUrl(link.link.story?.full_slug || link.link.cached_url)"
                  :target="link.link.target"
                  :class="[
                    'hover:underline cursor-pointer transition-colors duration-200',
                    { '!text-blue-700 dark:text-blue-500': isActiveLink(link.link.story?.full_slug || link.link.cached_url) }
                  ]"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </template>
          </ul>
        </div>
      </div>

      <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />

      <div class="sm:flex sm:items-center sm:justify-between">
        <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          {{ config.copyright }}
        </span>
        <div class="flex mt-4 sm:justify-center sm:mt-0">
          <div
            v-for="inBlok in config.socials"
            :key="inBlok._uid"
            class="px-2 cursor-pointer"
          >
            <StoryblokComponent :blok="inBlok" />
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
