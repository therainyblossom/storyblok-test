import { defineRule } from 'vee-validate'

type RuleItem = {
  operator: string;
  error_message?: string;
  reference_value?: string | number;
};

export const validateInput = (ruleSet: RuleItem[]) => {
  const errMsg = ruleSet.map((item: RuleItem) => ({
    name: item.operator,
    error_message: item.error_message
  }))
  const rules: string[] = []

  defineRule('email', (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return true
  })

  defineRule('required', (value: string) => {
    if (value == '') {
      const found = errMsg.find((msg) => msg.name === 'not empty')
      return found && found.error_message
        ? found.error_message
        : 'Value cannot be empty'
    }
    return true
  })
  defineRule('min', (value: string, [target]: number[]) => {
    if (value.length < target) {
      const found = errMsg.find((msg) => msg.name === 'greater or equal')
      return found && found.error_message
        ? found.error_message
        : `Value must be greater or equal to ${target}`
    }
    return true
  })
  defineRule('greater', (value: string, [target]: number[]) => {
    if (value.length < target) {
      const found = errMsg.find((msg) => msg.name === 'greater')
      return found && found.error_message
        ? found.error_message
        : `Value must be greater than ${target - 1}`
    }
    return true
  })
  defineRule('max', (value: string, [target]: number[]) => {
    if (value.length > target) {
      const found = errMsg.find((msg) => msg.name === 'less or equal')
      return found && found.error_message
        ? found.error_message
        : `Value must be smaller or equal to ${target}`
    }
    return true
  })
  defineRule('less', (value: string, [target]: number[]) => {
    if (value.length >= target) {
      const found = errMsg.find((msg) => msg.name === 'less')
      return found && found.error_message
        ? found.error_message
        : `Value must be smaller than ${target}`
    }
    return true
  })
  defineRule('equal', (value: unknown, [target]: unknown[]) => {
    if (typeof value === 'string' || Array.isArray(value)) {
      const found = errMsg.find((msg) => msg.name === 'equal')
      if (value !== target) {
        return found && found.error_message
          ? found.error_message
          : `Value must be equal to ${target}`
      }
    }
    return true
  })

  defineRule('contain', (value: string, [substring]: string[]) => {
    const arr = substring.split(';')
    for (const item of arr) {
      if (typeof value === 'string' && typeof item === 'string') {
        if (!value.includes(item)) {
          const found = errMsg.find((msg) => msg.name === 'contain')
          return found && found.error_message
            ? found.error_message
            : `Value must contain "${item}"`
        }
      } else {
        return `Value must contain "${item}"`
      }
    }
    return true
  })
  defineRule('not_contain', (value: string, [substring]: string[]) => {
    const arr = substring.split(';')
    for (const item of arr) {
      if (typeof value === 'string' && typeof item === 'string') {
        if (value.includes(item)) {
          const found = errMsg.find((msg) => msg.name === 'not contain')
          return found && found.error_message
            ? found.error_message
            : `Value must not contain "${item}"`
        }
      } else {
        return `Value must not contain "${item}"`
      }
    }
    return true
  })
  defineRule('not_equal', (value: unknown, [target]: unknown[]) => {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length != target || `Value must not be equal to ${target}`
    }
    return `Value must not be equal to ${target}`
  })
  ruleSet.forEach((rule: any) => {
    switch (rule.operator) {
      case 'equal':
        rules.push(`equal:${rule.reference_value}`)
        break
      case 'not equal':
        rules.push(`not_equal:${rule.reference_value}`)
        break
      case 'greater':
        rules.push(`greater:${Number(rule.reference_value) + 1}`)
        break
      case 'less':
        rules.push(`less:${Number(rule.reference_value) - 1}`)
        break
      case 'less or equal':
        rules.push(`max:${rule.reference_value}`)
        break
      case 'greater or equal':
        rules.push(`min:${rule.reference_value}`)
        break
      case 'contain':
        rules.push(`contain:${rule.reference_value}`)
        break
      case 'not contain':
        rules.push(`not_contain:${rule.reference_value}`)
        break
      case 'not empty':
        rules.push('required')
        break
    }
  })

  return rules
}