declare module 'ora' {
  interface Ora {
    start(): Ora
    fail(message?: string): Ora
    succeed(message?: string): Ora
    warn(message?: string): Ora
    info(message?: string): Ora
    text: string
  }

  function ora(message: string): Ora

  export = ora
}
