<script setup lang="ts">
import type { PropType } from 'vue'

// type HeroBlok = {
//   alertText: string;
//   alertBadge: string;
//   alertLink: string;
//   title: string;
//   description: string;
//   primaryButtonText: string;
//   primaryButtonLink: string;
//   secondaryButtonText: string;
//   secondaryButtonLink: string;
//   featuredInText: string;
//   featuredLogos: { src: string; alt: string; href: string }[];
// };

type DefaultHeroBlok = {
  headline: string
  description: string
  buttons: string[]
  featuredIn: string
  featuredPlatforms: string[]
  badgeText: string
  badgeLink: string
  logos: string[]
}

defineProps({
  blok: {
    type: Object as PropType<DefaultHeroBlok>,
    required: true
  }
})
</script>

<template>
  <section
    v-editable="blok"
    class="bg-white dark:bg-gray-900"
    :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
  >
    <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 ">
      <a
        href="#"
        class="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
        role="alert"
      >
        <span class="text-xs bg-primary-600 rounded-full text-white px-4 py-1.5 mr-3">New</span>
        <span class="text-sm font-medium">{{ blok.badgeText }}</span>
        <svg
          class="ml-2 w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </a>
      <h1
        class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white"
      >
        {{ blok.headline }}
      </h1>
      <div
        v-html="renderedDescription(blok.description)"
        class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400"
      ></div>
      <div
        class="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4"
      >
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
      <div class="px-4 mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36">
        <span class="font-semibold text-gray-400 uppercase">{{ blok.featuredIn }}</span>
        <div
          class="flex flex-wrap justify-center items-center mt-8 text-gray-500 sm:justify-between"
        >
          <StoryblokComponent v-for="image in blok.logos" :key="image._uid" :blok="image" />
        </div>
      </div>
    </div>
  </section>
</template>
