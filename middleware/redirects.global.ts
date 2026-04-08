export default defineNuxtRouteMiddleware((to, from) => {
  if (from.fullPath.includes('?_storyblok')) return
  if (to.path === '/home') {
    return navigateTo('/', { redirectCode: 301 })
  }
})
