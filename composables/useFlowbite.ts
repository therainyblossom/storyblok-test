export function useFlowbite(callback: (arg: any) => void): void {
  if (import.meta.client) {
    import('flowbite').then((flowbite) => {
      callback(flowbite)
    })
  }
}
