<script setup>
defineProps({ blok: Object })
</script>

<template>
  <div v-editable="blok" class="p-4 shadow-lg rounded-lg">
    <h1 class="text-lg font-bold text-gray-600">{{ blok.name }}</h1>
  </div>
</template>
