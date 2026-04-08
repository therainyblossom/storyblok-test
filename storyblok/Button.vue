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
    :to="useFormatUrl(blok.link.story?.full_slug || blok.link.cached_url)"
    :target="blok.link.target"
    :class="[
      'inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center dark:text-white',
      {
        'text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800':
          blok.style === 'secondary',
        'text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:text-white dark:focus:ring-primary-900 rounded-lg':
          blok.style === 'primary'
      },
      blok.class
    ]"
  >
    <span
      :class="{
        'order-1': blok.icon_position === 'right',
        'order-2': blok.icon_position === 'left'
      }"
    >
      {{ blok.label }}
    </span>
    <div
      :class="[
        ,
        {
          'order-2': blok.icon_position === 'right',
          'order-1': blok.icon_position === 'left'
        }
      ]"
      v-if="blok.icon && blok.icon.length > 0"
    >
      <template v-for="inBlok in blok.icon" :key="inBlok._uid">
        <NuxtImg
          v-if="inBlok.icon_file.filename"
          provider="storyblok"
          :width="inBlok.icon_width ?? 20"
          :height="inBlok.icon_height ?? 20"
          :src="inBlok.icon_file.filename"
          :alt="inBlok.icon_file.alt"
          class="mx-2"
        />
        <div
          v-if="inBlok.icon_svg"
          v-html="inBlok.icon_svg"
          class="mx-2"
          :class="{
            'text-gray-900 dark:text-white':
              blok.style === 'secondary',
            'text-white':
              blok.style === 'primary'
          }"
          :style="{
            width: (inBlok.icon_width ?? 20) + 'px',
            height: (inBlok.icon_height ?? 20) + 'px'
          }"
        />
      </template>
    </div>
  </NuxtLink>
</template>
