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
    class="inline-flex justify-center items-center p-5 text-base font-medium text-gray-500 bg-gray-50 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
  >
    <NuxtImg class="mr-3" :src="blok.icon?.filename" width="17" height="20" :alt="blok.icon?.alt" />
    <span class="w-full">{{ blok.title }}</span>
    <svg
      class="ml-3 w-6 h-6"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
        clip-rule="evenodd"
      ></path>
    </svg>
  </NuxtLink>
</template>
