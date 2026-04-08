<script setup lang="ts">
import getVersion from '~/composables/getVersion'

const route = useRoute()
const { slug } = route.params
const resolveRelations = ['form-area.form,form.fields']
const isPreview = computed(() => !!route.query._storyblok)
const { locale } = useI18n()
const config = useRuntimeConfig()
const folderSpace = config.public.FOLDER_SPACE

const getStoryblokSlug = () => {
  const path = route.path

  // Special case for home page
  if (path === '/' || path === '') {
    return folderSpace ? `${folderSpace}/` : '/home'
  }

  // For preview mode
  if (isPreview.value) {
    const url = slug ? (Array.isArray(slug) ? slug.join('/') : slug) : ''
    return url
  }

  // Use the URL slug
  const url = slug ? (Array.isArray(slug) ? slug.join('/') : slug) : ''
  return folderSpace ? `${folderSpace}/${url}` : `/${url}`
}

const fullSlug = getStoryblokSlug()
const story = await useAsyncStoryblok(
  fullSlug,
  {
    version: getVersion(),
    resolve_relations: resolveRelations,
    resolve_links: 'url',
    language: locale.value
  },
  { resolveRelations, resolveLinks: 'url' }
)

if (!story?.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
}

useSeoMetatags(
  story.value.content.SEO,
  'Education Storyblok',
  'Learn more about Storyblok and headless CMS. Explore tutorials, tips, and best practices for building modern web applications.',
  story.value.content.no_index
)
</script>

<template>
  <div>
    <StoryblokComponent v-if="story?.content" :blok="story.content" class="!px-0" />
  </div>
</template>
