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
    <h2 class="mb-1 text-lg font-bold">{{ blok.title }}</h2>
    <div v-html="renderedDescription(blok.description)" class="mb-1 text-sm text-gray-400"></div>
    <div v-for="inblok in blok.button" :key="inblok._uid" class="inline-flex">
      <StoryblokComponent :blok="inblok" />
    </div>
  </div>
</template>
