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
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16">
      <div class="grid gap-8 items-center mb-8 lg:gap-12 lg:grid-cols-12">
        <div class="col-span-6 text-center sm:mb-6 lg:text-left lg:mb-0">
          <h1
            class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl xl:text-6xl dark:text-white"
          >
            {{ blok.title }}
          </h1>
          <div
            v-html="renderedDescription(blok.description)"
            class="mx-auto mb-6 max-w-xl font-light text-gray-500 lg:mx-0 xl:mb-8 md:text-lg xl:text-xl dark:text-gray-400"
          ></div>
          <form action="#" class="">
            <div
              class="justify-center items-center mx-auto mb-3 space-y-4 sm:flex lg:justify-start sm:space-y-0 sm:space-x-4"
            >
              <div class="relative">
                <label
                  for="email"
                  class="hidden mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >Email address</label
                >
                <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <svg
                    class="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                    ></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                </div>
                <input
                  class="block p-3 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:w-80 xl:w-96 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Enter your email"
                  type="email"
                  id="email-signup"
                  required=""
                />
              </div>
              <button
                type="submit"
                class="w-full sm:w-auto justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg px-5 py-2.5 text-center inline-flex items-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Sign up
                <svg
                  class="ml-2 -mr-1 w-5 h-5"
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
              </button>
            </div>
          </form>
        </div>
        <div class="col-span-6">
          <div v-for="inblok in blok.video" :key="inblok._uid" class="h-[350px]">
            <StoryblokComponent :blok="inblok" />
          </div>
        </div>
      </div>
      <div
        class="grid grid-cols-2 gap-8 mx-auto max-w-screen-xl text-gray-500 sm:gap-12 md:grid-cols-3 lg:grid-cols-6 dark:text-gray-400"
      >
        <div class="flex justify-center" v-for="inblok in blok.sponsor" :key="inblok._uid">
          <StoryblokComponent :blok="inblok" />
        </div>
      </div>
    </div>
  </section>
</template>
