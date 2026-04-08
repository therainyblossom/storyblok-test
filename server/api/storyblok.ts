export const getStories = async (spaceId: string, token: string) => {
  return await $fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/stories?per_page=100`, {
    headers: { Authorization: token },
  })
}

export const createStory = async (spaceId: string, token: string, name: string, parentId: number | null, content: object) => {
  return await $fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      story: {
        name: name,
        parent_id: parentId,
        content: content
      }
    }),
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { action, name, parentId, content } = body
  const config = useRuntimeConfig()
  const token = config.AUTH_TOKEN
  const spaceId = config.public.SPACE_ID

  if (action === 'getStories') {
    return await getStories(spaceId, token)
  }

  if (action === 'createStory') {
    return await createStory(spaceId, token, name, parentId, content)
  }
})