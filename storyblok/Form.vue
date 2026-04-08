<script setup lang="ts">
import { Form } from 'vee-validate'

const props = defineProps({
  blok: {
    type: Object,
    required: true
  },
  formSlug: {
    type: String,
  }
})

interface form {
  [key: string]: string | number | boolean | null | undefined
}

interface Story {
  is_folder: boolean
  full_slug: string
  id: number
}

interface Stories {
  stories: Story[]
}

interface GetStoriesResponse {
  data: Stories
  status: number
}

const getFolderIdByName = async (folderSlug: string) => {
  const data = (await getStories()) as GetStoriesResponse
  const folder = data?.data.stories.find((s: Story) => s.is_folder && s.full_slug === folderSlug)
  return folder ? folder.id : null
}

const formValue = ref<form>({})
const formStatus = ref('')

const submitForm = async (values: any, { resetForm }: any) => {
  try {
    let res
    if (props.blok.data_save_collection != null && props.blok.data_save_collection != '') {
      const folderId = await getFolderIdByName(props.blok.data_save_collection)
      const valueString = Object.entries(formValue.value)
        .map(
          ([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
        )
        .join('\n')
      res = await createStory(props.blok.headline, folderId, {
        component: 'field-data',
        label: props.blok.headline,
        value: valueString
      })
    } else {
      res = await fetch(props.blok.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValue.value)
      })
    }
    if (res && res.status == 200) {
      formStatus.value = 'success'
      formValue.value = {}
      resetForm()
    } else {
      formStatus.value = 'fail'
    }
  } catch (error) {
    console.error('Form submit error:', error)
    formStatus.value = 'fail'
  }
}

const fields = props.blok.fields ?? []

await Promise.all(fields.map(async (field: any, index: number) => {
  try {
    const res = await useAsyncStoryblok(field.full_slug, {
      version: 'draft',
      resolve_relations: 'FormInput.validation_rules'
    })

    const fetched = res?.value ?? null
    if (fetched) {
      fields[index] = fetched
    }
  } catch (err) {
    console.log(err)
  }
}))

</script>

<template>
  <section v-editable="blok" class="bg-white dark:bg-gray-900">
    <div class="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
      <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">
        {{ blok.headline }}
      </h2>
      <div v-html="renderedDescription(blok.description)"
        class="mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl"></div>
      <div v-if="formStatus == 'success'"
        class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400"
        role="alert">
        <span class="font-medium">{{ blok.success_message || 'Form submitted successfully' }}</span>
      </div>

      <div v-else-if="formStatus == 'fail'"
        class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
        <span class="font-medium">{{ blok.fail_message || 'Form submitted failed' }}</span>
      </div>
      <Form v-slot="{ meta }" action="#" class="space-y-5 flex-wrap flex justify-between" @submit="submitForm">
        <div v-for="inblok in blok?.fields" :key="inblok._uid"
          :style="inblok?.content.width === 'half' ? 'width: 48%' : 'width: 100%'">
          <label :class="{ invisible: inblok?.content.show_label == 'false' }"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            {{ inblok?.content.label }}
          </label>
          <template v-if="inblok?.content.type === 'select'">
            {{ inblok.content.validation_rules }}
            <InputSelect v-model="formValue[inblok?.content.name]" :blok="inblok?.content" :slug="inblok.full_slug" />
          </template>
          <template v-else-if="inblok?.content.type === 'radio'">
            <InputRadio v-model="formValue[inblok?.content.name]" :blok="inblok?.content" :slug="inblok.full_slug" />
          </template>

          <template v-else-if="inblok?.content.type === 'checkbox'">
            <InputCheckbox v-model="formValue[inblok?.content.name]" :blok="inblok?.content" :slug="inblok.full_slug" />
          </template>
          <template v-else>
            <InputField v-model="formValue[inblok?.content.name]" :blok="inblok?.content" :slug="inblok.full_slug" />
          </template>
        </div>
        <button :disabled="!meta.valid" type="submit" :class="[
          'py-3 px-5 text-sm font-medium text-center text-white rounded-lg sm:w-fit focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-800',
          meta.valid
            ? 'bg-primary-700 hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-700'
            : 'bg-gray-400 cursor-not-allowed'
        ]">
          Submit
        </button>
      </Form>
    </div>
  </section>
</template>
