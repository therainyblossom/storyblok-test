<script setup lang="ts">
import type { PropType } from 'vue'

type BrandLogoBlok = {
  name: string
  image: string
  svg: string
  url: string
}

defineProps({
  blok: {
    type: Object as PropType<BrandLogoBlok>,
    required: true
  }
})
</script>

<template>
  <a v-editable="blok" :href="blok.url" class="mr-5 mb-5 lg:mb-0 hover:text-gray-800 dark:hover:text-gray-400">
    <div v-if="blok.svg" class="flex h-11" v-html="blok.svg" />
    <img
v-else
:src="blok.image"
:alt="blok.name"
class="h-11" >
  </a>
</template>

<style scoped></style>
