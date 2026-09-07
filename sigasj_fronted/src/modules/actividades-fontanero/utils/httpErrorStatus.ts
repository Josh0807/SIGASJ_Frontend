const HTTP_ERROR_PATTERN = /^HTTP (\d+):\s*([\s\S]*)$/

export const getHttpErrorStatus = (error: unknown): number | null => {
  if (!(error instanceof Error) || !error.message.trim()) {
    return null
  }

  const strictMatch = HTTP_ERROR_PATTERN.exec(error.message)
  if (strictMatch) {
    return Number(strictMatch[1])
  }

  const looseMatch = /HTTP\s+(\d+)/i.exec(error.message)
  return looseMatch ? Number(looseMatch[1]) : null
}

/** Reintenta rutas alternativas solo ante fallos transitorios o de ruta. */
export const shouldRetryAlternatePath = (error: unknown): boolean => {
  const status = getHttpErrorStatus(error)
  if (status === null) {
    return true
  }

  return status === 404 || status >= 500
}

export const sortTiposActividad = <T extends { orden: number }>(tipos: T[]): T[] =>
  [...tipos].sort((left, right) => left.orden - right.orden)
