<template>
  <div v-editable="blok">
    <NuxtLink
      :to="blok.link?.cached_url"
      :target="blok.link?.target"
      class="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900"
    >
      <template v-for="inBlok in blok.icon || []" :key="inBlok._uid">
        <StoryblokComponent :blok="inBlok" />
      </template>
    </NuxtLink>
    <h3 class="mb-2 text-xl font-bold dark:text-white">{{ blok.title }}</h3>
    <div
      v-html="renderedDescription(blok.description)"
      class="text-gray-500 dark:text-gray-400"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>
