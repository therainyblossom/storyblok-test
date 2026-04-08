<script setup lang="ts">
const props = defineProps({
  blok: {
    type: Object,
    required: true
  }
})

const isYouTubeUrl = (url: string) => {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'))
}

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) {
    return ''
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  if (match && match[2].length === 11) {
    const videoId = match[2]
    let embedUrl = `https://www.youtube.com/embed/${videoId}`

    const params = []
    if (props.blok.video && props.blok.video[0] && props.blok.video[0].autoplay) {
      params.push('mute=1')
      params.push('autoplay=1')
    }

    if (params.length > 0) {
      embedUrl += '?' + params.join('&')
    }

    return embedUrl
  }

  return url
}
</script>

<template>
  <section
    v-editable="blok"
    :class="['bg-white dark:bg-gray-900', blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
  >
    <div
      class="my-lg grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12"
    >
      <div class="mr-auto place-self-center lg:col-span-7">
        <h1
          class="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white"
        >
          {{ blok.heading }}
        </h1>
        <div
          v-html="renderedDescription(blok.description)"
          class="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400 prose dark:prose-invert max-w-none"
        ></div>
        <div class="flex items-center gap-4">
          <div class="inline-flex" v-for="inblok in blok.button" :key="inblok._uid">
            <StoryblokComponent :blok="inblok" />
          </div>
        </div>
      </div>
      <div class="hidden lg:mt-0 lg:col-span-5 lg:flex">
        <NuxtImg
          v-if="blok.image.filename"
          provider="storyblok"
          width="520"
          height="389"
          :src="blok.image.filename"
          :alt="blok.image.alt"
        />
        <iframe
          v-else-if="blok.video[0]?.video.filename && isYouTubeUrl(blok.video[0].video.filename)"
          class="w-full h-full rounded-lg"
          :src="getYouTubeEmbedUrl(blok.video[0].video.filename)"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
        <video
          v-else-if="blok.video[0]?.video.filename"
          class="w-full h-full rounded-lg"
          :src="blok.video[0].video.filename"
          controls
          :autoplay="blok.video[0].autoplay"
          loop
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  </section>
</template>
