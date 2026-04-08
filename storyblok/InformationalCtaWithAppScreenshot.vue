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
    <div class="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
      <div class="mr-auto place-self-center lg:col-span-7">
        <h1
          class="max-w-2xl mb-6 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl xl:text-6xl dark:text-white"
        >
          {{ blok.title }}
        </h1>
        <div
          v-html="renderedDescription(blok.description)"
          class="max-w-2xl mb-6 font-light text-gray-500 lg:mb-10 md:text-lg lg:text-xl dark:text-gray-400"
        ></div>
        <div
          class="items-center justify-between p-4 mb-4 space-y-4 bg-gray-100 rounded dark:bg-gray-700 sm:flex sm:space-y-0"
        >
          <div v-for="inblok in blok.informational" :key="inblok._uid">
            <StoryblokComponent :blok="inblok" />
          </div>
          <a
            href="#"
            class="inline-flex items-center justify-center w-full px-5 py-3 text-base font-medium text-center text-white rounded-lg sm:w-auto bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
          >
            <svg
              class="w-5 h-5 mr-2 -ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              ></path>
            </svg>
            Download
          </a>
        </div>
        <div class="text-sm text-gray-500">{{ blok.term }}</div>
      </div>
      <div class="hidden lg:mt-0 lg:col-span-5 ps-4 lg:flex">
        <NuxtImg
          provider="storyblok"
          :src="blok.image.filename"
          :alt="blok.image.alt"
          width="520"
          height="389"
        />
      </div>
    </div>
    <div
      class="grid max-w-screen-xl grid-cols-2 gap-8 px-4 pb-8 mx-auto text-gray-500 lg:pb-16 sm:gap-12 md:grid-cols-3 lg:grid-cols-6 dark:text-gray-400"
    >
      <div class="flex justify-center" v-for="inblok in blok.sponsor" :key="inblok._uid">
        <StoryblokComponent :blok="inblok" />
      </div>
    </div>
  </section>
</template>
