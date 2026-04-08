<script setup lang="ts">
const props = defineProps({
  blok: {
    type: Object,
    required: true
  }
})

const { optimizedUrl: firstImgOptimizedUrl } = useImageHandler(
  props.blok.first_image?.filename,
  props.blok.first_image?.is_external_url
)
const { optimizedUrl: secondImgOptimizedUrl } = useImageHandler(
  props.blok.second_image?.filename,
  props.blok.second_image?.is_external_url
)
const { optimizedUrl: thirdImgOptimizedUrl } = useImageHandler(
  props.blok.third_image?.filename,
  props.blok.third_image?.is_external_url
)

const navigate = (url?: string) => {
  if (!url) return
  window.location.href = url
}

</script>

<template>
  <section
    v-editable="blok"
    class="bg-white dark:bg-gray-900"
    :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
  >
    <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
      <div class="grid grid-cols-2 gap-2">
        <div
          @click="navigate(blok.first_link?.url)"
          :style="{ backgroundImage: `url('${firstImgOptimizedUrl}')` }"
          class="p-8 col-span-2 text-left h-96 bg-no-repeat bg-cover bg-center bg-gray-500 bg-blend-multiply hover:bg-blend-normal"
        >
          <h2 class="mb-5 max-w-xl text-5xl font-extrabold tracking-tight leading-tight text-white">
            {{ blok.first_title }}
          </h2>
          <template v-for="inblok in blok.first_button" :key="inblok._uid">
            <StoryblokComponent :blok="inblok" />
          </template>
        </div>
        <div
          @click="navigate(blok.second_link?.url)"
          :style="{ backgroundImage: secondImgOptimizedUrl ? `url('${secondImgOptimizedUrl}')` : 'none' }"
          class="p-8 col-span-2 md:col-span-1 text-left h-96 bg-no-repeat bg-cover bg-center bg-gray-500 bg-blend-multiply hover:bg-blend-normal"
        >
          <h2 class="mb-5 max-w-xl text-4xl font-extrabold tracking-tight leading-tight text-white">
            {{ blok.second_title }}
          </h2>
          <div v-for="inblok in blok.second_button" :key="inblok._uid">
            <StoryblokComponent :blok="inblok" />
          </div>
        </div>
        <div
          @click="navigate(blok.thirdlink?.url)"
          :style="{ backgroundImage: `url('${thirdImgOptimizedUrl}')` }"
          class="p-8 col-span-2 md:col-span-1 text-left h-96 bg-no-repeat bg-cover bg-center bg-gray-500 bg-blend-multiply hover:bg-blend-normal"
        >
          <h2 class="mb-5 max-w-xl text-4xl font-extrabold tracking-tight leading-tight text-white">
            {{ blok.third_title }}
          </h2>
          <div v-for="inblok in blok.third_button" :key="inblok._uid">
            <StoryblokComponent :blok="inblok" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
