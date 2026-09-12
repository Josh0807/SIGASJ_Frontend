import { getHttpErrorStatus } from '../../actividades-fontanero/utils/httpErrorStatus'

export type AveriaAdminErrorKind =
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'unexpected'

export type AveriaAdminError = {
  kind: AveriaAdminErrorKind
}

export function parseAveriaAdminError(error: unknown): AveriaAdminError {
  const status = getHttpErrorStatus(error)

  if (status === 401) {
    return { kind: 'unauthorized' }
  }
  if (status === 403) {
    return { kind: 'forbidden' }
  }
  if (status === 404) {
    return { kind: 'not-found' }
  }

  return { kind: 'unexpected' }
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}
