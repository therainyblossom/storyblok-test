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
    :to="useFormatUrl(blok.link?.story?.full_slug || blok.link?.cached_url)"
    :target="blok.link?.target"
    :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
  >
    <NuxtImg
      :src="blok.image.filename"
      :alt="blok.image.alt"
      provider="storyblok"
      :width="blok.image_width ?? 100"
      :height="blok.image_height ?? 100"
    />
  </NuxtLink>
</template>
