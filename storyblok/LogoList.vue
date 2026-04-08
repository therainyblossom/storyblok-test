<script setup lang="ts">
import { NuxtLink } from '#components'

defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section
    v-if="blok.is_grid === false"
    v-editable="blok"
    class="bg-white dark:bg-gray-900"
    :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
  >
    <div class="py-8 lg:py-16 mx-auto max-w-screen-xl px-4">
      <h2
        class="mb-8 lg:mb-16 text-3xl font-extrabold tracking-tight leading-tight text-center text-gray-900 dark:text-white md:text-4xl"
      >
        {{ blok.title }}
      </h2>
      <div
        class="grid grid-cols-2 gap-8 text-gray-500 sm:gap-12 md:grid-cols-3 lg:grid-cols-6 dark:text-gray-400"
      >
        <template v-for="inBlok in blok.logo" :key="inBlok._uid">
          <NuxtLink
            class="flex justify-center items-center"
            :to="useFormatUrl(inBlok.link?.story?.full_slug || inBlok.link?.cached_url)"
            :target="inBlok.link?.target"
          >
            <NuxtImg
              provider="storyblok"
              :src="inBlok.image.filename"
              :alt="inBlok.image.alt"
              width="150"
              height="50"
              class="h-9"
            />
          </NuxtLink>
        </template>
      </div>
    </div>
  </section>
  <section v-else v-editable="blok" class="bg-white dark:bg-gray-900">
    <div
      class="grid gap-8 py-8 px-4 mx-auto max-w-screen-xl sm:gap-16 lg:gap-20 md:grid-cols-2 lg:py-16 md:px-6"
    >
      <div class="text-gray-500 sm:text-lg dark:text-gray-400 mb-8">
        <h2
          class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white"
        >
          {{ blok.title }}
        </h2>
      </div>
      <div class="grid grid-cols-2 gap-8 text-gray-500 sm:gap-12 sm:grid-cols-3 dark:text-gray-400">
        <template v-for="inBlok in blok.logo" :key="inBlok._uid">
          <NuxtLink
            class="flex justify-center items-center"
            :to="useFormatUrl(inBlok.link?.story?.full_slug || inBlok.link?.cached_url)"
            :target="inBlok.link?.target"
          >
            <NuxtImg
              provider="storyblok"
              :src="inBlok.image.filename"
              :alt="inBlok.image.alt"
              width="150"
              height="50"
              class="h-9"
            />
          </NuxtLink>
        </template>
      </div>
    </div>
  </section>
</template>
