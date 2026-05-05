/// <reference types="vite/client" />

// Polyfill declarations for Node.js modules in browser
declare interface Window {
  global: any
  Buffer: any
  process: any
}

declare module 'process' {
  const proc: any
  export default proc
}
