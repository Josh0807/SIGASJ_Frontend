import {
  CODIGO_SEGUIMIENTO_MAX,
  CODIGO_SEGUIMIENTO_PATTERN,
  IDENTIFICACION_SEGUIMIENTO_MAX,
  type ConsultarSeguimientoPayload,
} from './seguimientoPublicoTypes'
import {
  MENSAJE_CODIGO_FORMATO,
  MENSAJE_CODIGO_OBLIGATORIO,
  MENSAJE_IDENTIFICACION_LARGO,
  MENSAJE_IDENTIFICACION_OBLIGATORIA,
} from './seguimientoPublicoMessages'

export type ErroresSeguimientoLocal = {
  codigo?: string
  identificacion?: string
}

export const normalizarCodigoSeguimiento = (codigo: string) =>
  codigo.trim().toUpperCase()

export const normalizarIdentificacionSeguimiento = (identificacion: string) =>
  identificacion.trim()

/**
 * Validación estructural local (required / formato).
 * No afirma existencia ni correspondencia — eso lo decide Backend.
 */
export const validarSeguimientoLocal = (input: {
  codigo: string
  identificacion: string
}): {
  errores: ErroresSeguimientoLocal
  payload: ConsultarSeguimientoPayload | null
} => {
  const codigo = normalizarCodigoSeguimiento(input.codigo)
  const identificacion = normalizarIdentificacionSeguimiento(input.identificacion)
  const errores: ErroresSeguimientoLocal = {}

  if (!codigo) {
    errores.codigo = MENSAJE_CODIGO_OBLIGATORIO
  } else if (
    codigo.length > CODIGO_SEGUIMIENTO_MAX ||
    !CODIGO_SEGUIMIENTO_PATTERN.test(codigo)
  ) {
    errores.codigo = MENSAJE_CODIGO_FORMATO
  }

  if (!identificacion) {
    errores.identificacion = MENSAJE_IDENTIFICACION_OBLIGATORIA
  } else if (identificacion.length > IDENTIFICACION_SEGUIMIENTO_MAX) {
    errores.identificacion = MENSAJE_IDENTIFICACION_LARGO
  }

  if (Object.keys(errores).length > 0) {
    return { errores, payload: null }
  }

  return {
    errores: {},
    payload: { codigo, identificacion },
  }
}
