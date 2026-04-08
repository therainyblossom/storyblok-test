<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div v-editable="blok" :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]">
    <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ blok.title }}</div>
    <div
      v-html="renderedDescription(blok.description)"
      class="text-sm text-gray-500 dark:text-gray-400"
    ></div>
  </div>
</template>
