<script setup lang="ts">
defineProps({ blok: Object })
</script>

<template>
  <div
    v-editable="blok"
    class="grid grid-cols-1 gap-6 py-8 mb-6 justify-items-center mx-auto"
    :class="{
      'sm:grid-cols-2': (blok.columns?.length || 1) >= 2,
      'lg:grid-cols-3': (blok.columns?.length || 1) >= 3,
      'lg:grid-cols-4': (blok.columns?.length || 1) >= 4,
    }"
  >
    <div v-for="inblok in blok.columns" :key="inblok._uid" class="flex-auto px-6">
      <StoryblokComponent :blok="inblok" />
    </div>
  </div>
</template>
