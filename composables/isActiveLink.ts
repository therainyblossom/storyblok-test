export const useActiveLink = () => {
  const route = useRoute()
  
  const isActiveLink = (linkUrl: string) => {
    if (!linkUrl) return false
    return route.path === linkUrl || route.path.startsWith('/' + linkUrl)
  }
  
  return { isActiveLink }
}