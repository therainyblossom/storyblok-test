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
    <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
      <div class="max-w-screen-md mb-8 lg:mb-16">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          {{ blok.title }}
        </h2>
        <div
          v-html="renderedDescription(blok.description)"
          class="text-gray-500 sm:text-xl dark:text-gray-400"
        ></div>
      </div>
      <div class="flex flex-col sm:flex-row gap-5 justify-center">
        <div class="md:w-1/3" v-for="inblok in blok.content_block" :key="inblok._uid">
          <StoryblokComponent :blok="inblok" />
        </div>
      </div>
    </div>
  </section>
</template>
