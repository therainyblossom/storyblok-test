<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div
    v-editable="blok"
    :class="[
      'p-4 text-primary-700 bg-primary-100 rounded-lg dark:bg-primary-900 dark:text-primary-300',
      blok.custom_class
    ]"
  >
    <h2 class="text-3xl font-extrabold leading-tight">{{ blok.title }}</h2>
    <div
      v-html="renderedDescription(blok.description)"
      class="text-primary-500 dark:text-primary-400"
    ></div>
  </div>
</template>
