/** Mensaje genérico alineado con Backend 4.14.1 (anti-enumeración). */
export const MENSAJE_SEGUIMIENTO_NO_ENCONTRADO =
  'No fue posible localizar una solicitud con los datos proporcionados. Verifique la información e inténtelo nuevamente.'

export const MENSAJE_SEGUIMIENTO_RATE_LIMIT =
  'Se han realizado demasiadas consultas. Intente nuevamente más tarde.'

export const MENSAJE_SEGUIMIENTO_SERVIDOR =
  'No fue posible realizar la consulta en este momento. Intente nuevamente más tarde.'

export const MENSAJE_SEGUIMIENTO_RED =
  'No fue posible conectar con el servicio. Verifique su conexión e inténtelo nuevamente.'

export const MENSAJE_CODIGO_OBLIGATORIO =
  'El código de seguimiento es obligatorio.'

export const MENSAJE_IDENTIFICACION_OBLIGATORIA =
  'La identificación es obligatoria.'

export const MENSAJE_CODIGO_FORMATO =
  'El código de seguimiento no tiene un formato válido (ej. SOL-2026-00001).'

export const MENSAJE_IDENTIFICACION_LARGO =
  'La identificación no puede exceder 30 caracteres.'

/** Mensaje seguro para la UI a partir del error HTTP (sin filtrar detalle técnico). */
export const mensajeErrorSeguimientoPublico = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return MENSAJE_SEGUIMIENTO_SERVIDOR
  }

  const match = /HTTP\s+(\d{3})/i.exec(error.message)
  const status = match ? Number(match[1]) : null

  if (status === 404) return MENSAJE_SEGUIMIENTO_NO_ENCONTRADO
  if (status === 429) return MENSAJE_SEGUIMIENTO_RATE_LIMIT
  if (status === 400) {
    // Validación de DTO: mensaje genérico comprensible, sin payload técnico.
    return 'Los datos ingresados no son válidos. Revise el código y la identificación.'
  }
  if (status != null && status >= 500) return MENSAJE_SEGUIMIENTO_SERVIDOR

  const lower = error.message.toLowerCase()
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('networkerror')
  ) {
    return MENSAJE_SEGUIMIENTO_RED
  }

  return MENSAJE_SEGUIMIENTO_SERVIDOR
}
