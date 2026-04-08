<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  blok: {
    type: Object,
    required: true
  }
})

const carouselRef = ref<HTMLElement | null>(null)

function initFlowbiteCarousel() {
  if (window && window.Carousel && carouselRef.value) {
    new window.Carousel(carouselRef.value)
  }
}

onMounted(() => {
  initFlowbiteCarousel()
})

watch(
  () => props.blok.images,
  () => {
    setTimeout(() => {
      initFlowbiteCarousel()
    }, 0)
  }
)
</script>

<template>
    <section
      v-editable="blok"
      class="bg-white dark:bg-gray-900 antialiased"
      :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
    >
      <div class="max-w-screen-xl px-4 py-8 mx-auto lg:px-6 sm:py-16 lg:py-24">
        <div class="flex flex-col gap-8 lg:items-center lg:gap-16 lg:flex-row">
          <div class="lg:max-w-xl xl:shrink-0">
            <div>
              <h2
                class="text-3xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white sm:text-5xl"
              >
                {{ blok.title }}
              </h2>
              <div
                v-html="renderedDescription(blok.description)"
                class="mt-5 text-base font-normal text-gray-500 dark:text-gray-400 md:max-w-3xl sm:text-xl"
              ></div>
            </div>
            <div class="flex flex-col gap-4 mt-8 sm:flex-row">
              <template v-for="inblok in blok.button" :key="inblok._uid">
                <StoryblokComponent :blok="inblok" />
              </template>
            </div>
            <div class="mt-4 sm:border-t sm:border-gray-100 sm:mt-8 sm:pt-8 dark:border-gray-700">
              <p
                class="hidden text-base font-medium text-gray-500 sm:block"
                v-if="blok.sponsor.length > 0"
              >
                {{ blok.sponsor_text }}:
              </p>
              <div class="flex items-center mt-3 max-w-md gap-5">
                <template v-for="sponsor in blok.sponsor" :key="sponsor._uid">
                  <StoryblokComponent :blok="sponsor" />
                </template>
              </div>
            </div>
          </div>
          <div
            ref="carouselRef"
            id="default-carousel"
            class="relative w-full"
            data-carousel="slide"
          >
            <!-- Carousel wrapper -->
            <div class="relative h-56 overflow-hidden rounded-lg md:h-96">
              <template v-for="(image, idx) in blok.images" :key="image._uid">
                <div
                  class="hidden duration-700 ease-in-out rounded-lg"
                  data-carousel-item
                  :class="{ block: idx === 0 }"
                >
                  <NuxtImg
                    provider="storyblok"
                    width="592"
                    height="730"
                    :src="image.filename"
                    class="absolute rounded-lg block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                    alt=""
                  />
                </div>
              </template>
            </div>
            <!-- Slider indicators -->
            <div class="absolute z-30 flex space-x-3 -translate-x-1/2 bottom-5 left-1/2">
              <template v-for="(image, index) in blok.images" :key="image._uid">
                <button
                  type="button"
                  class="w-3 h-3 rounded-full"
                  aria-current="false"
                  aria-label="Slide {{ index + 1 }}"
                  :data-carousel-slide-to="index"
                ></button>
              </template>
            </div>
            <!-- Slider controls -->
            <button
              type="button"
              class="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
              data-carousel-prev
            >
              <span
                class="inline-flex items-center justify-center w-10 h-10 text-white bg-gray-800 rounded-full sm:w-12 sm:h-12 group-hover:bg-gray-900"
              >
                <svg
                  class="w-5 h-5 sm:w-6 sm:h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.707 4.293a1 1 0 010 1.414L8.414 11l5.293 5.293a1 1 0 01-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 0z"
                  ></path>
                </svg>
              </span>
            </button>
            <button
              type="button"
              class="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
              data-carousel-next
            >
              <span
                class="inline-flex items-center justify-center w-10 h-10 text-white bg-gray-800 rounded-full sm:w-12 sm:h-12 group-hover:bg-gray-900"
              >
                <svg
                  class="w-5 h-5 sm:w-6 sm:h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.293 4.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L11.586 11l-5.293-5.293a1 1 0 010-1.414z"
                  ></path>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
</template>
