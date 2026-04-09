<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    required: true
  },
  variant: {
    type: String,
    default: 'default'
  }
})
</script>

<template>
  <div
    v-editable="blok"
    class="container-content mb-8 md:mb-12"
    :class="{
      'text-left': blok.alignment === 'left',
      'text-center': blok.alignment === 'center' || !blok.alignment,
      'text-right': blok.alignment === 'right',
    }"
  >
    <span
      v-if="blok.kicker"
      class="mb-2 block text-sm font-semibold uppercase tracking-wider text-primary-600"
      :class="{ 'text-white/70': variant === 'light' }"
    >
      {{ blok.kicker }}
    </span>
    <component
      :is="blok.tag || 'h2'"
      class="font-bold tracking-tight text-gray-900 dark:text-white"
      :class="[
        {
          'text-4xl md:text-5xl': (blok.visual_tag || 'h2') === 'h1',
          'text-3xl md:text-4xl': (blok.visual_tag || 'h2') === 'h2',
          'text-2xl md:text-3xl': (blok.visual_tag || 'h2') === 'h3',
          'text-xl md:text-2xl': (blok.visual_tag || 'h2') === 'h4',
        },
        { '!text-white': variant === 'light' },
      ]"
    >
      {{ blok.title }}
    </component>
    <div
      v-if="blok.show_separator !== false"
      class="mx-auto mt-4 h-1 w-12 rounded bg-primary-600"
      :class="{
        'mx-0': blok.alignment === 'left',
        'ml-auto mr-0': blok.alignment === 'right',
      }"
    />
    <p
      v-if="blok.subtitle"
      class="mt-4 text-lg text-gray-500 dark:text-gray-400"
      :class="{ '!text-white/80': variant === 'light' }"
    >
      {{ blok.subtitle }}
    </p>
  </div>
</template>
