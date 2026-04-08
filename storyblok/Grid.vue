<script setup lang="ts">
defineProps({ blok: Object })
</script>

<template>
  <div v-editable="blok" class="grid py-8 mb-6 justify-items-center mx-auto" :class="`grid-cols-${blok.columns?.length || 1}`">
    <div v-for="inblok in blok.columns" :key="inblok._uid" class="flex-auto px-6">
      <StoryblokComponent :blok="inblok" />
    </div>
  </div>
</template>
