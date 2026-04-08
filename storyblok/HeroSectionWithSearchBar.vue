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
    <div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-16">
      <div class="grid items-center gap-8 mb-8 lg:mb-16 lg:gap-12 lg:grid-cols-12">
        <div class="col-span-6 text-center sm:mb-6 lg:text-left lg:mb-0">
          <h1
            class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl xl:text-6xl dark:text-white"
          >
            {{ blok.title }}
          </h1>
          <div
            v-html="renderedDescription(blok.description)"
            class="max-w-xl mx-auto mb-6 font-light text-gray-500 lg:mx-0 xl:mb-8 md:text-lg xl:text-xl dark:text-gray-400"
          ></div>
          <form class="max-w-lg mx-auto lg:ml-0" action="#">
            <label
              for="default-search"
              class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300"
              >Search</label
            >
            <div class="relative">
              <input
                type="search"
                id="default-search"
                class="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                :placeholder="blok.input_placeholder"
                required=""
              />
              <button
                type="submit"
                class="text-white inline-flex items-center absolute right-2.5 bottom-2.5 bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                <svg
                  class="w-4 h-4 mr-2 -ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                {{ blok.button_text }}
              </button>
            </div>
          </form>
        </div>
        <div class="col-span-6">
          <NuxtImg
            provider="storyblok"
            :src="blok.image.filename"
            :alt="blok.image.alt"
            width="520"
            height="389"
            class="w-full rounded-lg"
          />
        </div>
      </div>
      <div class="grid gap-8 sm:gap-12 md:grid-cols-3">
        <div class="flex justify-center" v-for="inblok in blok.information" :key="inblok._uid">
          <StoryblokComponent :blok="inblok" />
        </div>
      </div>
    </div>
  </section>
</template>
