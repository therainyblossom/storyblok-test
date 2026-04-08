<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <tr
    v-editable="blok"
    class="bg-white border-b dark:bg-gray-900 dark:border-gray-700"
    :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
  >
    <th
      scope="row"
      class="px-6 py-4 text-xl font-bold text-gray-900 whitespace-nowrap dark:text-white"
    >
      {{ blok.title }} <span class="text-gray-500 dark:text-gray-400">{{ blok.alias }}</span>
    </th>
    <td class="px-6 py-4 text-xl font-bold text-gray-900 dark:text-white">${{ blok.value }}</td>
    <td class="px-6 py-4 text-sm font-semibold text-red-500">{{ blok.percentage }}%</td>
    <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">${{ blok.market_cap }}</td>
    <td class="px-6 py-4 text-right">
      <NuxtLink
        :to="blok.link?.cached_url"
        :target="blok.link?.target"
        class="px-4 py-2 font-medium text-white rounded bg-primary-600 hover:bg-primary-700"
        >{{ blok.link_text }}</NuxtLink
      >
    </td>
  </tr>
</template>
