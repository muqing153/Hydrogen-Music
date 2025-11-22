declare module 'qrcode-terminal' {
  interface QRCodeOptions {
    small?: boolean
    level?: 'L' | 'M' | 'Q' | 'H'
  }
  function generate(input: string, options?: QRCodeOptions, callback?: (qr: string) => void): void
  export = { generate }
}

