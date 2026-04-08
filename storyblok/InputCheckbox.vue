<script setup lang="ts">
import { useField } from 'vee-validate'

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

const emit = defineEmits(['update:modelValue'])
const handleInput = () => {
  emit('update:modelValue', checkboxValues.value)
}
const checkboxValues = ref<Record<string, string>>({})

const {
  value: modelValue,
  errorMessage,
  validate
} = useField(props.blok.name, rules.join('|'), {
  initialValue: props.blok.default_value
})

watch(
  checkboxValues,
  (newVal, oldVal) => {
    modelValue.value = Object.keys(newVal).filter((key) => newVal[key])
  },
  { deep: true }
)

const error = ref('')
const onBlurHandler = async (event: FocusEvent) => {
  const result = await validate()
  error.value = result.errors[0]
}
</script>

<template>
  <div v-editable="blok">
    <div class="flex items-center my-2" v-for="option in blok.options" :key="option._uid">
      <input
        :id="option.label"
        type="checkbox"
        :value="option.value"
        v-model="checkboxValues[option.label]"
        @blur="onBlurHandler"
        @change="handleInput"
        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      />
      <label :for="option.label" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{{
        option.label
      }}</label>
    </div>
    <p v-if="error" class="text-red-500 text-xs mt-1">
      {{ error }}
    </p>
  </div>
</template>
