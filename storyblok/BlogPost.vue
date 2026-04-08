<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article v-editable="blok">
    <div class="space-y-3" :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]">
      <span
        :class="[
          blok.tag_color,
          'text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300'
        ]"
      >
        <NuxtImg
          v-if="blok.tag_image"
          provider="storyblok"
          :src="blok.tag_image?.filename"
          :alt="blok.tag_image?.alt"
          width="12"
          height="12"
          class="mr-1"
        />
        {{ blok.tag }}
      </span>

      <h2 class="text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
        <a href="#" class="hover:underline" title="">
          {{ blok.title }}
        </a>
      </h2>

      <div
        v-html="renderedDescription(blok.description)"
        class="mt-2 text-base font-normal text-gray-500 dark:text-gray-400"
      ></div>

      <NuxtLink
        :to="useFormatUrl(blok.link?.story?.full_slug || blok.link?.cached_url)"
        :target="blok.link?.target"
        class="mt-2 inline-flex items-center text-base font-semibold leading-tight text-primary-600 hover:underline dark:text-primary-500"
      >
        Read more
        <svg
          aria-hidden="true"
          class="w-4 h-4 ml-2"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </NuxtLink>
    </div>
  </article>
</template>
