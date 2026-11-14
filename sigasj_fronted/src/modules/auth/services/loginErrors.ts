export const CREDENTIALS_ERROR_MESSAGE =
  'Las credenciales ingresadas no son correctas.'

export const GENERIC_LOGIN_ERROR_MESSAGE =
  'No fue posible iniciar sesión. Inténtalo nuevamente.'

export const INACTIVE_USER_MESSAGE = 'El usuario se encuentra inactivo.'

export const FORBIDDEN_LOGIN_MESSAGE =
  'No tiene permisos para iniciar sesión en el sistema.'

export const BACKEND_UNAVAILABLE_DEV_MESSAGE =
  'No fue posible conectar con el servidor. Confirme que el backend esté disponible.'

const isBackendUnavailableSignal = (raw: string, detail: string): boolean => {
  if (/failed to fetch|networkerror|load failed|econnrefused|etimedout/i.test(raw)) {
    return true
  }
  // Vite proxy caído suele devolver 5xx con cuerpo vacío o status genérico.
  if (/^HTTP 5\d\d/i.test(raw)) {
    const normalized = detail.toLowerCase()
    return (
      !detail ||
      normalized === 'internal server error' ||
      normalized === 'bad gateway' ||
      normalized === 'service unavailable' ||
      normalized === 'gateway timeout' ||
      normalized === 'respuesta no exitosa' ||
      /econnrefused|proxy/i.test(detail)
    )
  }
  return false
}

/**
 * Normaliza errores de red/HTTP a mensajes comprensibles.
 * Nunca expone AxiosError, Failed to fetch ni JSON técnico.
 */
export const mapLoginErrorMessage = (raw: string): string => {
  const detail = raw.replace(/^HTTP \d+:\s*/i, '').trim()
  const normalized = detail.toLowerCase()

  if (isBackendUnavailableSignal(raw, detail)) {
    return import.meta.env.DEV
      ? BACKEND_UNAVAILABLE_DEV_MESSAGE
      : GENERIC_LOGIN_ERROR_MESSAGE
  }

  if (normalized.includes('inactivo')) {
    return detail || INACTIVE_USER_MESSAGE
  }

  if (/^HTTP 403/i.test(raw) || normalized === 'forbidden') {
    return FORBIDDEN_LOGIN_MESSAGE
  }

  if (
    /credenciales/i.test(detail) ||
    /^HTTP 401/i.test(raw) ||
    normalized.includes('unauthorized')
  ) {
    return CREDENTIALS_ERROR_MESSAGE
  }

  if (/^HTTP 400/i.test(raw)) {
    if (detail.length <= 180 && !detail.startsWith('{') && !detail.includes('\n')) {
      return detail
    }
    return GENERIC_LOGIN_ERROR_MESSAGE
  }

  if (/^HTTP 5\d\d/i.test(raw) || !detail) {
    return GENERIC_LOGIN_ERROR_MESSAGE
  }

  if (detail.length <= 180 && !detail.startsWith('{') && !detail.includes('\n')) {
    return detail
  }

  return GENERIC_LOGIN_ERROR_MESSAGE
}
