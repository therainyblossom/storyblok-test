<script setup lang="ts">
const props = defineProps({
  blok: {
    type: Object,
    required: true
  }
})

const { optimizedUrl } = useImageHandler(
  props.blok.background_image?.filename,
  props.blok.background_image?.is_external_url
)
</script>

<template>
  <section v-editable="blok" class="px-4" :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]">
    <div
      :style="{ backgroundImage: `url('${optimizedUrl}')` }"
      class="bg-no-repeat bg-cover bg-center bg-gray-700 bg-blend-multiply relative py-8 px-4 mx-auto max-w-screen-xl text-white lg:py-16 z-1"
    >
      <div class="mb-6 max-w-screen-lg lg:mb-0">
        <h1
          class="mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl lg:text-6xl"
        >
          {{ blok.title }}
        </h1>
        <div
          v-html="renderedDescription(blok.description)"
          class="mb-6 font-light text-gray-400 lg:mb-8 md:text-lg lg:text-xl"
        ></div>
        <div v-for="inblok in blok.button" :key="inblok._uid">
          <StoryblokComponent :blok="inblok" />
        </div>
      </div>
      <div
        class="grid gap-8 pt-8 lg:pt-12 mt-8 lg:mt-12 border-t border-gray-600 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div v-for="inblok in blok.cta" :key="inblok._uid" class="inline-flex">
          <StoryblokComponent :blok="inblok" />
        </div>
      </div>
    </div>
  </section>
</template>
