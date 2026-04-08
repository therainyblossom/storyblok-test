export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/form-builder')) return

  if ('_storyblok' in to.query) return

  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
})
