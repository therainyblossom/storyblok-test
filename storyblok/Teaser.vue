<script setup>
defineProps({ blok: Object })
</script>

<template>
  <div v-editable="blok" class="py-8 mb-6 text-5xl font-bold text-center text-gray-600"
    :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]">
    {{ blok.headline }}
  </div>
</template>
