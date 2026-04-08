<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <NuxtLink v-editable="blok" :to="useFormatUrl(blok.link.story?.full_slug || blok.link.cached_url)" :target="blok.link.target" :class="[
    'inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center',
    {
      'text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800': blok.style === 'secondary',
      'text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900 rounded-lg': blok.style === 'primary'
    },
    blok.custom_class
  ]">
    <span :class="{ 'order-2': blok.icon_positionP === 'right', 'order-1': blok.icon_position === 'left' }">
      {{ blok.label }}
    </span>
    <NuxtImg v-if="blok.icon.filename" provider="storyblok" :width="blok.icon_width ?? 20"
      :height="blok.icon_height ?? 20" :src="blok.icon.filename" :alt="blok.icon.alt" class="mx-2" />
  </NuxtLink>
</template>
