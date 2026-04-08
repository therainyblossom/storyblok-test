<script setup lang="ts">
const props = defineProps({
  blok: {
    type: Object,
    required: true
  }
})
const counters = ref<{ [key: string]: number }>({})
const moduleRef = ref<HTMLElement | null>(null)
const gridClasses = computed(() => {
  if (!props.blok.is_grid) {
    return 'grid gap-8 mt-8 text-gray-900 sm:grid-cols-2 lg:gap-20 lg:mt-14 lg:grid-cols-4 dark:text-white'
  }

  const baseClasses = 'flex flex-col gap-3 mt-8 text-gray-900 lg:gap-3 lg:mt-14 dark:text-white'

  return `${baseClasses}`
})

function initializeCounters() {
  if (props.blok.statistic) {
    props.blok.statistic.forEach((stat: any) => {
      counters.value[stat._uid] = 0
    })
  }
}

function animateCounter(statId: string, targetValue: number) {
  const duration = 2500
  const startTime = Date.now()
  const start = 0

  const updateCount = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    const easeOut = 1 - Math.pow(1 - progress, 3)

    counters.value[statId] = Math.floor(start + (targetValue - start) * easeOut)

    if (progress < 1) {
      requestAnimationFrame(updateCount)
    } else {
      counters.value[statId] = targetValue
    }
  }

  requestAnimationFrame(updateCount)
}

function startCounterAnimations() {
  if (props.blok.statistic) {
    props.blok.statistic.forEach((stat: any, index: number) => {
      const targetNumber = parseInt(stat.stats_number) || 0

      setTimeout(() => {
        animateCounter(stat._uid, targetNumber)
      }, index * 200)
    })
  }
}

function getDisplayValue(stat: any): number {
  return counters.value[stat._uid] || 0
}

onMounted(async () => {
  initializeCounters()

  await nextTick()

  if (moduleRef.value) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCounterAnimations()
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(moduleRef.value)
  }
})
</script>

<template>
  <section
    v-editable="blok"
    class="bg-white dark:bg-gray-900"
    ref="moduleRef"
    :class="[blok.margin?.[0]?.vertical, blok.margin?.[0]?.horizontal]"
  >
    <div class="max-w-screen-xl py-8 lg:py-16 px-4 mx-auto lg:px-6" :class="{ flex: blok.is_grid }">
      <div>
        <h2
          class="mb-4 text-3xl tracking-tight font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white"
        >
          {{ blok.title }}
        </h2>
        <div
          v-html="renderedDescription(blok.description)"
          class="max-w-2xl font-light text-gray-500 sm:text-xl dark:!text-white"
        ></div>
      </div>
      <dl :class="gridClasses">
        <div
          :class="[
            blok.is_card ? 'dark:bg-gray-800 p-6 text-center bg-gray-100 rounded xl:p-12' : '',
            'flex flex-col'
          ]"
          v-for="inBlok in blok.statistic"
          :key="inBlok._uid"
        >
          <dt class="mb-2 text-3xl md:text-4xl font-extrabold tracking-tight">
            {{ getDisplayValue(inBlok) }}
            <div class="text-2xl mt-2 font-bold">
              {{ inBlok.title }}
            </div>
          </dt>
          
          <div
            v-html="renderedDescription(inBlok.description)"
            class="font-light text-gray-500 dark:text-gray-400"
          ></div>
        </div>
      </dl>
    </div>
  </section>
</template>
