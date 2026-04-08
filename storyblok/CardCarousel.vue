<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  blok: {
    type: Object,
    required: true
  }
})

const currentSlide = ref(0)
const sliderRef = ref<HTMLElement>()
const containerRef = ref<HTMLElement>()
const isSliderMode = ref(false)
const cardsPerView = ref(3)

const needsSlider = computed(() => {
  return props.blok.card.length > cardsPerView.value || isSliderMode.value
})

const totalSlides = computed(() => {
  if (!needsSlider.value) return 1
  return Math.ceil(props.blok.card.length / cardsPerView.value)
})

const checkResponsive = () => {
  if (import.meta.client) {
    const width = window.innerWidth
    if (width >= 1024) {
      cardsPerView.value = 3
      isSliderMode.value = false
    } else if (width >= 768) {
      cardsPerView.value = 2
      isSliderMode.value = true
    } else {
      cardsPerView.value = 1
      isSliderMode.value = true
    }
  }
}

const nextSlide = () => {
  if (currentSlide.value < totalSlides.value - 1) {
    currentSlide.value++
  } else {
    currentSlide.value = 0
  }
  updateSliderPosition()
}

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  } else {
    currentSlide.value = totalSlides.value - 1
  }
  updateSliderPosition()
}

const updateSliderPosition = () => {
  if (sliderRef.value && needsSlider.value) {
    const translateX = -(currentSlide.value * 100)
    sliderRef.value.style.transform = `translateX(${translateX}%)`
  }
}

onMounted(() => {
  checkResponsive()
  window.addEventListener('resize', checkResponsive)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkResponsive)
})
</script>

<template>
  <div v-editable="blok" class="container mx-auto px-4 py-8" 
    :class="[
      blok.margin?.[0]?.vertical,
      blok.margin?.[0]?.horizontal
    ]"
  >
    <div 
      v-if="!needsSlider"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-xl mx-auto"
    >
      <div v-for="inBlok in blok.card" :key="inBlok._uid" class="flex justify-center">
        <StoryblokComponent :blok="inBlok" class="w-full max-w-sm" />
      </div>
    </div>

    <div 
      v-else
      ref="containerRef"
      class="relative max-w-screen-xl mx-auto"
    >
      <button
        @click="prevSlide"
        class="absolute left-[20px] top-1/2 -translate-y-1/2 z-30 p-3 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 -ml-6"
        :class="{ 'opacity-50': currentSlide === 0 }"
      >
        <svg
          class="w-5 h-5 text-gray-600 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 6 10"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 1 1 5l4 4"
          />
        </svg>
        <span class="sr-only">Previous</span>
      </button>

      <button
        @click="nextSlide"
        class="absolute right-[20px] top-1/2 -translate-y-1/2 z-30 p-3 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 -mr-6"
        :class="{ 'opacity-50': currentSlide === totalSlides - 1 }"
      >
        <svg
          class="w-5 h-5 text-gray-600 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 6 10"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 9 4-4-4-4"
          />
        </svg>
        <span class="sr-only">Next</span>
      </button>

      <div class="overflow-hidden rounded-lg">
        <div 
          ref="sliderRef"
          class="flex transition-transform duration-500 ease-in-out"
        >
          <div
            v-for="slideIndex in totalSlides"
            :key="`slide-${slideIndex}`"
            class="w-full flex-shrink-0 grid gap-6 px-2"
            :class="{
              'grid-cols-1': cardsPerView === 1,
              'grid-cols-2': cardsPerView === 2,
              'grid-cols-3': cardsPerView === 3
            }"
          >
            <div
              v-for="cardIndex in cardsPerView"
              :key="`card-${slideIndex}-${cardIndex}`"
              class="flex justify-center"
            >
              <StoryblokComponent 
                v-if="blok.card[(slideIndex - 1) * cardsPerView + (cardIndex - 1)]"
                :blok="blok.card[(slideIndex - 1) * cardsPerView + (cardIndex - 1)]" 
                class="w-full max-w-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div 
        v-if="totalSlides > 1"
        class="flex justify-center mt-6 space-x-2"
      >
        <button
          v-for="(_, index) in totalSlides"
          :key="`dot-${index}`"
          @click="currentSlide = index; updateSliderPosition()"
          class="w-3 h-3 rounded-full transition-all duration-300"
          :class="[
            currentSlide === index
              ? 'bg-blue-600 dark:bg-blue-400'
              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
          ]"
        />
      </div>
    </div>
  </div>
</template>