<script setup lang="ts">

defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <span v-editable="blok">
    <NuxtImg
      v-if="blok.icon_file.filename"
      provider="storyblok"
      :width="blok.icon_width ?? 20"
      :height="blok.icon_height ?? 20"
      :src="blok.icon_file.filename"
      :alt="blok.icon_file.alt"
      class="mx-2"
    />
    <div
      v-if="blok.icon_svg"
      v-html="blok.icon_svg"
      class="mx-2 fill:white"
      :style="{
        width: (blok.icon_width ?? 20) + 'px',
        height: (blok.icon_height ?? 20) + 'px'
      }"
    />
  </span>
</template>
