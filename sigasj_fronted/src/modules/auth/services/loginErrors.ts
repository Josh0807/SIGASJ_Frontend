export const CREDENTIALS_ERROR_MESSAGE =
  'Las credenciales ingresadas no son correctas.'

export const GENERIC_LOGIN_ERROR_MESSAGE =
  'No fue posible iniciar sesión. Inténtalo nuevamente.'

export const INACTIVE_USER_MESSAGE = 'El usuario se encuentra inactivo.'

export const FORBIDDEN_LOGIN_MESSAGE =
  'No tiene permisos para iniciar sesión en el sistema.'

/**
 * Normaliza errores de red/HTTP a mensajes comprensibles.
 * Nunca expone AxiosError, Failed to fetch ni JSON técnico.
 */
export const mapLoginErrorMessage = (raw: string): string => {
  const detail = raw.replace(/^HTTP \d+:\s*/i, '').trim()
  const normalized = detail.toLowerCase()

  if (/failed to fetch|networkerror|load failed/i.test(raw)) {
    return import.meta.env.DEV
      ? 'No fue posible conectar con el servidor. Confirme que el backend esté disponible.'
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
