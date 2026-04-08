<script setup lang="ts">
import { NuxtImg } from '#components'

defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <template v-if="blok.is_horizontal == false">
    <div
      v-editable="blok"
      class="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
      :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
    >
      <a href="#">
        <NuxtImg
          v-if="blok.image.filename"
          width="382"
          height="254"
          :src="blok.image.filename"
          class="rounded-t-lg"
          :alt="blok.image.alt"
        />
      </a>
      <div class="p-5">
        <a href="#">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {{ blok.title }}
          </h5>
        </a>
        <div
          v-html="renderedDescription(blok.description)"
          class="mb-3 font-normal text-gray-700 dark:text-gray-400"
        ></div>
        <div class="mt-5" v-for="inBlok in blok.button || []" :key="inBlok._uid">
          <storyblok-component :blok="inBlok" />
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <a
      v-editable="blok"
      href="#"
      class="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-sm md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      <NuxtImg
        width="382"
        height="254"
        class="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
        :src="blok.image.filename"
        :alt="blok.image.alt"
      />
      <div class="flex flex-col justify-between p-4 leading-normal">
        <h5
          class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white animate-[counter_3s_ease-out_forwards] [counter-set:_num_var(--num)] before:content-[counter(num)]"
        >
          {{ blok.title }}
        </h5>
        <div
          v-html="renderedDescription(blok.description)"
          class="mb-3 font-normal text-gray-700 dark:text-gray-400"
        ></div>
      </div>
    </a>
  </template>
</template>
