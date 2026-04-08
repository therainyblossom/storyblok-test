<script setup lang="ts">
const props = defineProps({
  blok: {
    type: Object,
    required: true
  }
})

const blogPosts = props.blok.blog.slice(1)
const firstBlogPost = props.blok.blog[0]
</script>

<template>
  <section
    v-editable="blok"
    class="bg-white dark:bg-gray-900 antialiased"
    :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
  >
    <div class="max-w-screen-xl px-4 py-8 mx-auto lg:px-6 sm:py-16 lg:py-24">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-20">
        <article>
          <NuxtImg
            provider="storyblok"
            class="object-cover w-full rounded-lg"
            :src="firstBlogPost.image.filename"
            :alt="firstBlogPost.image.alt"
          />

          <div class="mt-5 space-y-3">
            <span
              :class="[
                firstBlogPost.tag_color,
                'text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300'
              ]"
            >
              <NuxtImg
                v-if="firstBlogPost.tag_icon?.filename"
                provider="storyblok"
                class="w-4 h-4 mr-1"
                width="12"
                height="12"
                :src="firstBlogPost.tag_icon?.filename"
                :alt="firstBlogPost.tag_icon?.alt"
              />
              {{ firstBlogPost.tag }}
            </span>

            <h2
              class="text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white"
            >
              <a href="#" class="hover:underline" title="">
                {{ firstBlogPost.title }}
              </a>
            </h2>

            <div class="flex items-center gap-3">
              <img
                class="w-8 h-8 rounded-full"
                src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/michael-gough.png"
                alt=""
              />
              <div class="text-md font-medium leading-tight text-gray-900 dark:text-white">
                <div>{{ firstBlogPost.author }}</div>
                <div class="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Posted on {{ firstBlogPost.author_date }}
                </div>
              </div>
            </div>

            <p class="text-base font-normal text-gray-500 dark:text-gray-400">
              {{ firstBlogPost.description }}
            </p>

            <NuxtLink
              :to="useFormatUrl(firstBlogPost.link?.story?.full_slug || firstBlogPost.link?.cached_url)"
              :target="firstBlogPost.link?.target"
              class="inline-flex items-center text-base font-semibold leading-tight text-primary-600 hover:underline dark:text-primary-500"
            >
              Read more
              <svg
                aria-hidden="true"
                class="w-4 h-4 ml-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </NuxtLink>
          </div>
        </article>

        <div class="space-y-8">
          <template v-for="post in blogPosts" :key="post._uid">
            <StoryblokComponent :blok="post" />
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
