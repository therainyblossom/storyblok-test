export const isDark = ref(false)

function updateTheme() {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

watch(isDark, (oldVar,newVal) => {
  updateTheme()
})

export function toggleTheme() {
  isDark.value = !isDark.value
  updateTheme()
}

export function setDarkTheme(theme: boolean = true) {
  isDark.value = theme
}