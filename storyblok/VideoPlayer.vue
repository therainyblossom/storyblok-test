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
  <div v-editable="blok" class="w-full h-full">
    <iframe
      v-if="blok.video.filename && isYouTubeUrl(blok.video.filename)"
      class="w-full h-full rounded-lg"
      :src="getYouTubeEmbedUrl(blok.video.filename)"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
    <video
      v-else-if="blok.video.filename"
      class="w-full h-full rounded-lg"
      :src="blok.video.filename"
      controls
      :autoplay="blok.autoplay"
      loop
    >
      Your browser does not support the video tag.
    </video>
  </div>
</template>
