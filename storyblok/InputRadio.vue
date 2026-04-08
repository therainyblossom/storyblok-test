<script setup lang="ts">
import { Field, useField } from 'vee-validate'

const props = defineProps({
  blok: {
    type: Object,
    required: true
  },
  slug: {
    type: String
  }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rules: any[] = []
if (props.blok && props.blok.validation_rules) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ruleset = props.blok.validation_rules.map((item: any) => item.content)
  rules = validateInput(ruleset)
}

const error = ref('')
const emit = defineEmits(['update:modelValue'])
const handleInput = () => {
  emit('update:modelValue', modelValue.value)
}

const {
  value: modelValue,
  validate
} = useField(props.blok.name, rules.join('|'), {
  initialValue: props.blok.options.find((item: { status: string }) => item.status == 'selected')?.value
})

const onBlurHandler = async (event: FocusEvent) => {
  const result = await validate()
  error.value = result.errors[0]
}
</script>

<template>
  <div v-editable="blok">
    <template v-for="option in blok.options" :key="option._uid">
      <div class="flex items-center my-2">
        <Field
          @blur="onBlurHandler"
          :id="option._uid"
          type="radio"
          :value="option.value"
          v-model="modelValue"
          @change="handleInput"
          :name="blok.name"
          :disabled="option.status == 'disabled'"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
          :for="option._uid"
          :class="[
            'ms-2 text-sm font-medium',
            option.status == 'disabled'
              ? 'text-gray-400 dark:text-white cursor-not-allowed'
              : 'text-gray-900 dark:text-gray-300'
          ]"
        >
          {{ option.label }}
        </label>
      </div>
    </template>
    <p v-if="error" class="text-red-500 text-xs mt-1">
      {{ error }}
    </p>
  </div>
</template>
