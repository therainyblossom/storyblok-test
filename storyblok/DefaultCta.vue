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
      <NuxtImg
        v-if="blok.icon?.filename"
        provider="storyblok"
        class="mb-3"
        width="24"
        height="24"
        :src="blok.icon.filename"
        :alt="blok.icon.alt"
      />
      <div class="max-w-screen-md">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          {{ blok.title }}
        </h2>
        <div
          v-html="renderedDescription(blok.description)"
          class="mb-8 font-light text-gray-500 sm:text-xl dark:text-gray-400"
        ></div>
        <div class="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div class="inline-flex" v-for="inblok in blok.button" :key="inblok._uid">
            <StoryblokComponent :blok="inblok" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
