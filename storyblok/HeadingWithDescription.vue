<script setup lang="ts">
const props = defineProps({
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
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
      <div class="max-w-screen-lg text-gray-500 sm:text-lg dark:text-gray-400">
        <h2 class="mb-4 text-4xl tracking-tight font-bold text-gray-900 dark:text-white">
          {{ blok.title }}
        </h2>
        <div v-html="renderedDescription(blok.description_body)" class="mb-4 font-light"></div>
        <p class="mb-4 font-medium">{{ blok.description_conclusion }}</p>
        <div class="inline-flex" v-for="inblok in blok.button" :key="inblok._uid">
          <StoryblokComponent :blok="inblok" />
        </div>
      </div>
    </div>
  </section>
</template>
