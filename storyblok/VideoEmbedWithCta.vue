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
    <div class="px-4 py-8 mx-auto max-w-screen-xl text-center lg:py-16 ">
      <h1
        class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white tracking-tight"
      >
        {{ blok.title }}
      </h1>
      <div
        v-html="renderedDescription(blok.description)"
        class="mb-8 font-light text-gray-500 md:text-lg lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400"
      ></div>
      <div
        class="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4"
      >
        <div class="inline-flex" v-for="inblok in blok.button" :key="inblok._uid">
          <StoryblokComponent :blok="inblok" />
        </div>
      </div>
      <div class="w-[672px] h-[384px] mx-auto" v-for="inblok in blok.video" :key="inblok._uid">
        <StoryblokComponent :blok="inblok" />
      </div>
    </div>
  </section>
</template>
