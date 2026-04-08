// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderedDescription = (text: any) => {
  if (!text) return ''
  return renderRichText(text)
}
