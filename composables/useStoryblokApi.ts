export const getStories = async () => {
  try {
    const data = await $fetch('/api/storyblok', {
      method: 'POST',
      body: {
        action: 'getStories',
      }
    })
    return { data, status: 200 }
  } catch (error) {
    return { data: null, status: error?.statusCode || 500, error }
  }
}

export const createStory = async (name: string, parentId: number | null, content: object) => {
  try {
    const data = await $fetch('/api/storyblok', {
      method: 'POST',
      body: {
        action: 'createStory',
        name,
        parentId,
        content
      }
    })
  
    return { data, status: 200 }
  } catch (error) {
    return { data: null, status: error?.statusCode || 500, error }
  }
}