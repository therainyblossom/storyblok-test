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
    id="accordion-collapse"
    data-accordion="collapse"
    :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
  >
    <template v-for="(inBlok, index) in blok.accordion" :key="inBlok._uid">
      <StoryblokComponent
        :blok="inBlok"
        :is-first="index === 0"
        :index="index"
        :is-last="index === blok.accordion.length - 1"
      />
    </template>
  </div>
</template>
