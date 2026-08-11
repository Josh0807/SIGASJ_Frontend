export class ApiError extends Error {
  readonly code: 'CONFIG' | 'NETWORK' | 'HTTP' | 'PARSE'
  readonly status?: number

  constructor(
    message: string,
    code: 'CONFIG' | 'NETWORK' | 'HTTP' | 'PARSE',
    status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}
