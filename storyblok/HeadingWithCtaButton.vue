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
      <div class="mx-auto max-w-screen-sm text-center">
        <h2
          class="mb-4 text-4xl tracking-tight font-extrabold leading-tight text-gray-900 dark:text-white"
        >
          {{ blok.title }}
        </h2>
        <div
          v-html="renderedDescription(blok.description)"
          class="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg"
        ></div>
        <div class="inline-flex" v-for="inblok in blok.button" :key="inblok._uid">
          <StoryblokComponent :blok="inblok" />
        </div>
      </div>
    </div>
  </section>
</template>
