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
      <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
        {{ blok.title }}
      </h2>
      <div
        v-html="renderedDescription(blok.description)"
        class="mb-3 font-light text-gray-500 dark:text-gray-400 sm:text-xl"
      ></div>
      <div class="grid gap-8 lg:grid-cols-2">
        <template v-for="inblok in blok.card" :key="inblok._uid">
          <StoryblokComponent :blok="inblok" />
        </template>
      </div>
    </div>
  </section>
</template>
