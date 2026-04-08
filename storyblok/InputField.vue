<script setup lang="ts">
import { useField, Field } from 'vee-validate'

const props = defineProps({
  blok: {
    type: Object,
    required: true
  },
  slug: {
    type: String
  }
})

const emit = defineEmits(['update:modelValue'])
const error = ref('')
const ruleList = ref()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rules: any[] = []
if (props.blok && props.blok.validation_rules) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ruleset = props.blok.validation_rules
    .map((item: any) => item.content)
    .filter((content: any) => content && typeof content.operator !== 'undefined')
  ruleList.value = ruleset
  rules = validateInput(ruleset)
}

if (props.blok.type === 'email') {
  rules.push('email')
}

const handleInput = () => {
  const val = modelValue.value
  emit('update:modelValue', val)
}

const {
  value: modelValue,
  validate
} = useField(props.blok.name, rules?.join('|'), {
  initialValue: props.blok.default_value
})

const onBlurHandler = async (event: FocusEvent) => {
  let customError = ''
  const customRule = ruleList.value?.find((item: { operator: string }) => item.operator === 'custom')
  if (customRule) {
    try {
      const codeBlock = customRule.custom_function.content?.find(
        (node: { type: string }) => node.type === 'code_block'
      )
      const codeString = codeBlock?.content?.[0]?.text ?? ''
      const customFn = new Function('value', codeString)
      customFn(modelValue.value)
    } catch (e: any) {
      customError = e.message || 'Custom validation failed'
    }
  }

  const result = await validate()
  // Show custom error if present, otherwise show vee-validate error
  error.value = customError || result.errors[0]
}
</script>

<template>
  <div v-editable="blok">
    <template v-if="blok.type == 'textarea'">
      <Field
        as="textarea"
        :id="blok.name"
        :name="blok.name"
        v-model="modelValue"
        @input="handleInput"
        @blur="onBlurHandler"
        :cols="blok.cols || 30"
        :rows="blok.rows || 5"
        :placeholder="blok.placeholder"
        class="resize-none shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg ..."
      />
    </template>
    <template v-else>
      <Field
        :id="blok.name"
        :name="blok.name"
        :type="blok.type"
        v-model="modelValue"
        @input="handleInput"
        @blur="onBlurHandler"
        class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
        :placeholder="blok.placeholder"
      />
    </template>
    <p v-if="error" class="text-red-500 text-xs mt-1">
      {{ error }}
    </p>
  </div>
</template>
