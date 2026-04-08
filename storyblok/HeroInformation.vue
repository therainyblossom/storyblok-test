<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div
    v-editable="blok"
    class="flex justify-center dark:bg-gray-900 dark:text-white p-4"
    :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
  >
    <NuxtImg
      class="w-6 h-6 mr-3 text-primary-600 dark:text-white shrink-0"
      provider="storyblok"
      :src="blok.icon.filename"
      :alt="blok.icon.alt"
      width="24"
      height="24"
    />

    <div>
      <h3 class="mb-1 text-lg font-semibold leading-tight text-gray-900 dark:text-white">
        {{ blok.title }}
      </h3>
      <div
        v-html="renderedDescription(blok.description)"
        class="font-light text-gray-500 dark:text-gray-400"
      ></div>
    </div>
  </div>
</template>
