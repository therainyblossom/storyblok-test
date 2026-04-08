<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div v-editable="blok" :class="[blok.vertical, blok.horizontal]"></div>
</template>
