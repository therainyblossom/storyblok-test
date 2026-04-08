<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section
    v-editable="blok"
    class="bg-white dark:bg-gray-900"
    :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
  >
    <div class="max-w-screen-xl px-4 py-8 mx-auto text-center sm:py-16 lg:px-6">
      <div class="max-w-screen-sm mx-auto">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          {{ blok.title }}
        </h2>
        <div
          v-html="renderedDescription(blok.description)"
          class="mb-6 lg:mb-16 font-light text-gray-500 md:text-lg dark:text-gray-400"
        ></div>
      </div>
      <!-- Table -->
      <div class="relative mb-8 overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <tbody>
            <template v-for="inblok in blok.crypto_info" :key="inblok._uid">
              <StoryblokComponent :blok="inblok" />
            </template>
          </tbody>
        </table>
      </div>
      <p class="mb-5 sm:text-xl text-center text-gray-500 dark:text-gray-400">
        {{ blok.link_label }}
      </p>
      <NuxtLink
        :to="blok.link?.cached_url"
        :target="blok.link?.target"
        class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
      >
        {{ blok.link_text }}</NuxtLink
      >
    </div>
  </section>
</template>
