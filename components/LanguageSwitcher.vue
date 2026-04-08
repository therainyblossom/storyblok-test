<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { onClickOutside } from '@vueuse/core'

const { t, locale, locales } = useI18n()
const localePath = useLocalePath()

type LocaleCode = 'en'  | 'de'
type LocaleOption = { code: LocaleCode; name: string }

const availableLocales = computed<LocaleOption[]>(() => {
  const value = locales.value
  return Array.isArray(value) ? (value as LocaleOption[]) : []
})

const isOpen = ref(false)
const rootEl = ref<HTMLElement | null>(null)

const labelText = computed(() => {
  return t('header.languageSwitcher.label')
})

const currentLocaleName = computed(() => {
  const current = availableLocales.value.find((l) => l.code === (locale.value as LocaleCode))
  return current?.name || locale.value
})

function closeDropdown() {
  isOpen.value = false
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

onClickOutside(rootEl, () => closeDropdown())
</script>

<template>
  <div ref="rootEl" class="relative inline-flex">
    <span class="sr-only">{{ labelText }}</span>

    <button
      class="cursor-pointer font-[Noto_Sans] text-sm md:text-base pr-9 text-gray-900 rounded-lg bg-white block w-full p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
      type="button"
      @click="toggleDropdown"
    >
      <span class="flex items-center gap-2">
        <span class="truncate">{{ currentLocaleName }}</span>
      </span>
      <span class="text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          aria-hidden="true"
          fill="none"
          height="1em"
          viewBox="0 0 17 11"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.50923 6.741L14.56 0.690201L16.2594 2.3904L8.50923 10.1408L0.759033 2.3904L2.45923 0.690201L8.50923 6.741Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>

    <div
      v-show="isOpen"
      :aria-label="labelText"
      class="absolute right-0 top-full mt-2 min-w-40 rounded-lg border border-gray-200 bg-white shadow-lg z-50 overflow-hidden dark:bg-gray-900 dark:border-gray-700"
    >
      <NuxtLink
        v-for="localeOption in availableLocales"
        :key="localeOption.code"
        :to="localePath('/', localeOption.code)"
        class="block px-3 py-2 text-sm md:text-base font-[Noto_Sans] text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:bg-gray-50 dark:text-white dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800"
        @click="closeDropdown"
      >
        {{ localeOption.name }}
      </NuxtLink>
    </div>
  </div>
</template>
