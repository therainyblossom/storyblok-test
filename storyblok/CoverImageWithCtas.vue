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
    class="overflow-hidden relative bg-white dark:bg-gray-900"
    :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
  >
    <div class="gap-8 py-8 px-4 mx-auto max-w-screen-xl lg:py-16 xl:grid xl:grid-cols-12">
      <div class="col-span-8">
        <h1
          class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white"
        >
          {{ blok.title }}
        </h1>
        <div
          v-html="renderedDescription(blok.description)"
          class="mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400"
        ></div>
        <div class="gap-16 items-center sm:flex">
          <div
            class="mb-8 text-gray-500 sm:mb-0 dark:text-gray-400"
            v-for="inblok in blok.cta"
            :key="inblok._uid"
          >
            <StoryblokComponent :blok="inblok" />
          </div>
        </div>
      </div>
      <div class="hidden absolute top-0 right-0 w-1/3 h-full xl:block">
        <NuxtImg
          provider="storyblok"
          class="object-cover w-full h-full"
          :src="blok.image.filename"
          :alt="blok.image.alt"
        />
      </div>
    </div>
  </section>
</template>
