<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section v-editable="blok" :aria-label="blok.heading?.[0]?.title" class="py-16 md:py-20">
    <div v-if="blok.heading?.[0]">
      <StoryblokComponent :blok="blok.heading[0]" />
    </div>

    <div
      v-if="blok.items?.length"
      class="container-content grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6"
      :class="{
        'lg:grid-cols-2': blok.items.length === 2,
        'lg:grid-cols-3': blok.items.length === 3,
        'lg:grid-cols-4': blok.items.length === 4,
      }"
    >
      <StoryblokComponent v-for="item in blok.items" :key="item._uid" :blok="item" />
    </div>
  </section>
</template>
