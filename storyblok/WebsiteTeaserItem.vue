<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <NuxtLink
    v-editable="blok"
    :to="blok.link?.story?.full_slug ? useFormatUrl(blok.link.story.full_slug) : (blok.link?.cached_url || '#')"
    :target="blok.link?.target"
    class="group relative block aspect-square overflow-hidden rounded-lg"
  >
    <NuxtImg
      v-if="blok.image?.filename"
      provider="storyblok"
      :src="blok.image.filename"
      :alt="blok.image.alt || blok.title || ''"
      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    <div class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
    <h3 class="absolute bottom-4 left-4 text-lg font-bold text-white">
      {{ blok.title }}
    </h3>
  </NuxtLink>
</template>
