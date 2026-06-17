declare const chrome: {
  runtime: { getURL: (path: string) => string }
  tabs: { create: (opts: { url: string }) => void }
}
