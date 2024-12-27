declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    jQuery: typeof import("jquery")
  }
}
