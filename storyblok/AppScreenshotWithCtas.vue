<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
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
    <div class="max-w-screen-xl px-4 pt-8 mx-auto text-center lg:pt-16 lg:px-12">
      <h1
        class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white"
      >
        {{ blok.title }}
      </h1>
      <div
        class="mb-8 font-light text-gray-500 md:text-lg lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400"
        v-html="renderedDescription(blok.description)"
      />
      <div
        class="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4"
      >
        <template v-for="inblok in blok.button" :key="inblok._uid">
          <StoryblokComponent :blok="inblok" />
        </template>
      </div>
      <NuxtImg
        class="mx-auto w-full max-w-2xl h-64 rounded-lg sm:h-96"
        provider="storyblok"
        :src="blok.image.filename"
        :alt="blok.image.alt"
        width="992"
        height="715"
      />
    </div>
    <div class="pt-48 lg:pb-16 pb-8 -mt-48 sm:pt-80 sm:-mt-80 z-2">
      <div class="px-4 mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36">
        <div
          class="flex flex-wrap items-center justify-center mt-8 text-gray-500 sm:justify-between"
        >
          <div v-for="inblok in blok.sponsor" :key="inblok._uid" class="inline-flex">
            <StoryblokComponent :blok="inblok" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
