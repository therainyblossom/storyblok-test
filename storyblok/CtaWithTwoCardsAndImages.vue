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
    <div class="max-w-screen-xl px-4 py-8 mx-auto lg:px-6 sm:py-16 lg:py-24">
      <div class="max-w-2xl mx-auto text-center">
        <h2
          class="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl dark:text-white"
        >
          {{ blok.title }}
        </h2>
        <div
          v-html="renderedDescription(blok.description)"
          class="mt-4 text-base font-normal text-gray-500 dark:text-gray-400 sm:text-xl"
        ></div>
      </div>

      <div class="grid grid-cols-1 gap-4 mt-8 xl:gap-12 md:grid-cols-2">
        <div
          class="p-5 space-y-4 bg-white border border-gray-200 rounded-lg shadow-md lg:p-8 dark:bg-gray-800 dark:border-gray-700"
        >
          <NuxtImg
            class="object-cover w-full rounded-lg shadow-lg"
            :src="blok.first_card_image.filename"
            :alt="blok.first_card_image.alt"
            width="461"
            height="345"
          />

          <div>
            <div class="flex items-center justify-between gap-6">
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold text-gray-900 dark:text-white">
                  ${{ blok.first_card_current_amount }}
                </span>
                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                  of {{ blok.first_card_goal }} goal
                </span>
              </div>
              <span class="text-xs font-normal text-right text-gray-500 dark:text-gray-400">
                {{ blok.first_card_donor }} donors
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
              <div
                class="bg-primary-600 h-2.5 rounded-full"
                :style="{ width: blok.first_card_progress + '%' }"
              />
            </div>
          </div>

          <h3 class="text-lg font-bold leading-tight text-gray-900 dark:text-white">
            {{ blok.first_card_title }}
          </h3>
          <p class="text-base font-normal text-gray-500 dark:text-gray-400">
            {{ blok.first_card_description }}
          </p>

          <div class="flex flex-col gap-4 sm:flex-row md:flex-col lg:flex-row lg:items-center">
            <template v-for="inblok in blok.first_card_button" :key="inblok._uid">
              <StoryblokComponent :blok="inblok" />
            </template>
          </div>
        </div>

        <div
          class="p-5 space-y-4 bg-white border border-gray-200 rounded-lg shadow-md lg:p-8 dark:bg-gray-800 dark:border-gray-700"
        >
          <NuxtImg
            class="object-cover w-full rounded-lg shadow-lg"
            :src="blok.second_card_image?.filename"
            :alt="blok.second_card_image?.alt"
            width="461"
            height="345"
          />

          <div>
            <div class="flex items-center justify-between gap-6">
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold text-gray-900 dark:text-white">
                  ${{ blok.second_card_current_amount }}</span
                >
                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                  of {{ blok.second_card_goal }} goal
                </span>
              </div>
              <span class="text-xs font-normal text-right text-gray-500 dark:text-gray-400">
                {{ blok.second_card_donor }} donors
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
              <div
                class="bg-primary-600 h-2.5 rounded-full"
                :style="{ width: blok.second_card_progress + '%' }"
              ></div>
            </div>
          </div>

          <h3 class="text-lg font-bold leading-tight text-gray-900 dark:text-white">
            {{ blok.second_card_title }}
          </h3>
          <p class="text-base font-normal text-gray-500 dark:text-gray-400">
            {{ blok.second_card_description }}
          </p>
          <div class="flex flex-col gap-4 sm:flex-row md:flex-col lg:flex-row lg:items-center">
            <template v-for="inblok in blok.second_card_button" :key="inblok._uid">
              <StoryblokComponent :blok="inblok" />
            </template>
          </div>
        </div>
      </div>

      <div class="mt-8 text-center">
        <template v-for="inblok in blok.button" :key="inblok._uid">
          <StoryblokComponent :blok="inblok" />
        </template>
      </div>
    </div>
  </section>
</template>
