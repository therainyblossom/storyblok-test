<script setup lang="ts">
const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

const { isActiveLink } = useActiveLink()
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const route = useRoute()

watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
  }
)

onMounted(() => {
  if (!props.config.theme_switcher) {
    setDarkTheme(false)
  }
})
</script>

<template>
  <nav
    id="default-header"
    :class="{ 'md:block': true, hidden: isMobileMenuOpen }"
    class="bg-white border-gray-200 dark:border-gray-600 dark:bg-gray-900"
  >
    <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
      <NuxtLink :to="'/home'" class="flex items-center z-[60]">
        <NuxtImg
          width="60"
          height="60"
          :src="config?.header_logo?.filename"
          :alt="config?.header_logo?.alt"
        />
      </NuxtLink>
      <div class="md:hidden z-[60] flex items-center gap-4">
        <LanguageSwitcher />
        <theme-switcher v-if="config.theme_switcher" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="20"
          height="20"
          viewBox="0 0 50 50"
          class="cursor-pointer"
          @click="toggleMobileMenu"
        >
          <path
            d="M 0 7.5 L 0 12.5 L 50 12.5 L 50 7.5 Z M 0 22.5 L 0 27.5 L 50 27.5 L 50 22.5 Z M 0 37.5 L 0 42.5 L 50 42.5 L 50 37.5 Z"
          />
        </svg>
      </div>
      <div
        id="mega-menu-full"
        class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
      >
        <ul class="flex font-medium lg:flex-row lg:space-x-8 lg:mt-0 gap-8">
          <template v-for="inBlok in config.nav_items" :key="inBlok._uid">
            <li class="flex items-center">
              <NuxtLink
                :to="useFormatUrl(inBlok.link.story?.full_slug || inBlok.link.cached_url)"
                :target="inBlok.link.target"
                :class="[
                  'text-gray-700 dark:text-white lg:dark:hover:bg-transparent',
                  {
                    '!text-blue-700 dark:text-blue-500': isActiveLink(
                      inBlok.link.story?.full_slug || inBlok.link.cached_url
                    )
                  }
                ]"
              >
                {{ inBlok.label }}
              </NuxtLink>
            </li>
          </template>
          <LanguageSwitcher />
          <theme-switcher v-if="config.theme_switcher" />
        </ul>
      </div>
    </div>
  </nav>
  <div v-if="isMobileMenuOpen" class="md:hidden fixed inset-0 bg-white z-50">
    <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
      <NuxtLink :to="'/'" class="flex items-center z-[60]">
        <NuxtImg
          width="60"
          height="60"
          :src="config?.header_logo?.filename"
          :alt="config?.header_logo?.alt"
        />
      </NuxtLink>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="20"
        height="20"
        viewBox="0 0 50 50"
        class="cursor-pointer md:hidden z-[60]"
        @click="toggleMobileMenu"
      >
        <path
          d="M 0 7.5 L 0 12.5 L 50 12.5 L 50 7.5 Z M 0 22.5 L 0 27.5 L 50 27.5 L 50 22.5 Z M 0 37.5 L 0 42.5 L 50 42.5 L 50 37.5 Z"
        />
      </svg>
    </div>
    <div class="p-4">
      <ul aria-labelledby="mega-menu-full-dropdown-button">
        <template v-for="inBlok in config.nav_items" :key="inBlok._uid">
          <li class="flex items-center py-4">
            <NuxtLink
              :to="useFormatUrl(inBlok.link.story?.full_slug || inBlok.link.cached_url)"
              :target="inBlok.link.target"
              :class="[
                'font-semibold text-gray-700 dark:text-white lg:dark:hover:bg-transparent',
                { '!text-blue-700 dark:text-blue-500': isActiveLink(inBlok.link.cached_url) }
              ]"
            >
              {{ inBlok.label }}
            </NuxtLink>
          </li>
        </template>
        <li v-for="item in config?.menu[0]?.nav_items" :key="item.id || item._uid">
          <NuxtLink
            :to="useFormatUrl(item.link.story?.full_slug || item.link.cached_url)"
            :target="item.link.target"
            class="block py-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div class="font-semibold">{{ item.label }}</div>
            <div
              class="text-sm text-gray-500 dark:text-gray-400"
              v-html="renderedDescription(item.description)"
            />
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
