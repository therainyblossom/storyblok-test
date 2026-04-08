export default function getFileTypeFromURL(url: string): string {
  const segments = url.split('/') // Split the URL by '/'
  const lastSegment = segments[segments.length - 1] // Extract the last segment (file name)
  const fileParts = lastSegment.split('.') // Split the file name by '.'

  if (fileParts.length === 1) {
    return ''
  } else {
    const extension = fileParts[fileParts.length - 1] // Retrieve the extension
    return extension.toLowerCase() // Return the extension in lowercase for consistency
  }
}
