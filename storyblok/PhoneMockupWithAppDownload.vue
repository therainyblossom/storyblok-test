<script setup lang="ts">
const props = defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section
    v-editable="blok"
    class="bg-white dark:bg-gray-900 antialiased"
    :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
  >
    <div class="max-w-screen-xl px-4 py-8 mx-auto lg:px-6 sm:py-16 lg:py-24">
      <div class="text-center">
        <div>
          <h2
            class="text-3xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl"
          >
            {{ blok.title }}
          </h2>
          <div
            v-html="renderedDescription(blok.description)"
            class="mt-4 text-base font-normal text-gray-500 dark:text-gray-400 md:max-w-3xl md:mx-auto sm:text-xl"
          ></div>
        </div>

        <div class="flex items-center justify-center gap-4 mt-8 max-w-sm mx-auto">
          <template v-for="inblok in blok.button" :key="inblok._uid">
            <StoryblokComponent :blok="inblok" />
          </template>
        </div>
      </div>

      <div class="my-8 sm:my-16">
        <div
          class="relative mx-auto border-gray-800 dark:border-gray-800 dark:bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px]"
        >
          <div
            class="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"
          ></div>
          <div
            class="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"
          ></div>
          <div
            class="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"
          ></div>
          <div
            class="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"
          ></div>
          <div
            class="rounded-[2.5rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800"
          >
            <NuxtImg
              class="w-full h-full object-cover"
              provider="storyblok"
              :src="blok.image.filename"
              :alt="blok.image.alt"
              width="272"
              height="572"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-5 sm:gap-6 sm:mt-8">
        <div class="flex -space-x-3 overflow-hidden">
          <img
            class="inline-block w-8 h-8 border border-white rounded-full dark:border-gray-900"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/neil-sims.png"
            alt=""
          />
          <img
            class="inline-block w-8 h-8 border border-white rounded-full dark:border-gray-900"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/jese-leos.png"
            alt=""
          />
          <img
            class="inline-block w-8 h-8 border border-white rounded-full dark:border-gray-900"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/michael-gough.png"
            alt=""
          />
          <img
            class="inline-block w-8 h-8 border border-white rounded-full dark:border-gray-900"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/roberta-casas.png"
            alt=""
          />
        </div>

        <div class="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

        <div>
          <div class="flex items-center gap-1.5">
            <div class="flex items-center gap-0.5">
              <svg
                aria-hidden="true"
                class="w-5 h-5 text-yellow-300"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <svg
                aria-hidden="true"
                class="w-5 h-5 text-yellow-300"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <svg
                aria-hidden="true"
                class="w-5 h-5 text-yellow-300"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <svg
                aria-hidden="true"
                class="w-5 h-5 text-yellow-300"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <svg
                aria-hidden="true"
                class="w-5 h-5 text-yellow-300"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </div>
            <span class="text-base font-normal text-gray-500 dark:text-gray-400"> 5.0 </span>
          </div>
          <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
            Rated Best Over
            <span class="font-semibold text-gray-900 dark:text-white">15.7k</span> Reviews
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
