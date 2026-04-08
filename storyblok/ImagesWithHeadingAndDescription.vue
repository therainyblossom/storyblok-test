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
    <div
      class="gap-16 items-center py-8 px-4 mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 lg:py-16 lg:px-6"
    >
      <div class="font-light text-gray-500 sm:text-lg dark:text-gray-400">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          {{ blok.title }}
        </h2>
        <div v-html="renderedDescription(blok.description)" class="mb-4"></div>
      </div>
      <div class="grid grid-cols-2 gap-4 mt-8">
        <NuxtImg
          provider="storyblok"
          class="w-full rounded-lg"
          width="284"
          height="394"
          :src="blok.first_image.filename"
          :alt="blok.first_image.alt"
        />
        <NuxtImg
          provider="storyblok"
          class="mt-4 w-full lg:mt-10 rounded-lg"
          width="284"
          height="394"
          :src="blok.second_image.filename"
          :alt="blok.second_image.alt"
        />
      </div>
    </div>
  </section>
</template>
