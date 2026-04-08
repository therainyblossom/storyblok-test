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
    <div
      class="gap-8 items-center py-8 px-4 mx-auto max-w-screen-xl xl:gap-16 md:grid md:grid-cols-2 sm:py-16 lg:px-6"
    >
      <NuxtImg
        v-if="blok.image.filename"
        provider="storyblok"
        class="w-full"
        width="584"
        height="420"
        :src="blok.image.filename"
        :alt="blok.image.alt"
      />
      <div
        v-else-if="blok.video"
        class="w-full h-full rounded-lg"
      >
        <div v-for="inblok in blok.video" :key="inblok._uid" class="h-[200px]">
          <StoryblokComponent :blok="inblok" />
        </div>
      </div>
      <div class="mt-4 md:mt-0">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          {{ blok.title }}
        </h2>
        <div
          v-html="renderedDescription(blok.description)"
          class="mb-6 font-light text-gray-500 md:text-lg dark:text-gray-400"
        ></div>
        <div class="inline-flex" v-for="inblok in blok.button" :key="inblok._uid">
          <StoryblokComponent :blok="inblok" />
        </div>
      </div>
    </div>
  </section>
</template>
