<!-- eslint-disable @typescript-eslint/no-explicit-any -->
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
  const ruleset = props.blok.validation_rules
    .map((item: any) => item.content)
    .filter((content: any) => content && typeof content.operator !== 'undefined')
  rules = validateInput(ruleset)
}

const emit = defineEmits(['update:modelValue'])
const handleInput = () => {
  emit('update:modelValue', modelValue.value)
}

const {
  value: modelValue,
  validate
} = useField(props.blok.name, rules.join('|'), {
  initialValue: props.blok.default_value
})

const error = ref('')
const onBlurHandler = async (event: FocusEvent) => {
  const result = await validate()
  error.value = result.errors[0]
}
</script>

<template>
  <div v-editable="blok">
    <select
      :id="blok.name"
      v-model="modelValue"
      @change="handleInput"
      @blur="onBlurHandler"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option
        v-for="option in blok.options"
        :key="option._uid"
        :value="option.value"
        :disabled="option.status == 'disabled'"
        :selected="option.status == 'selected'"
      >
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" class="text-red-500 text-xs mt-1">
      {{ error }}
    </p>
  </div>
</template>
