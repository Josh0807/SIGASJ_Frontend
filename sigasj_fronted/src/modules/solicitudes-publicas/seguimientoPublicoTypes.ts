import type { SolicitudEstado } from './types'

/** Evento público de GET/POST seguimiento (4.14.1). Sin notaInterna ni usuario. */
export type EventoSeguimientoPublico = {
  fecha: string
  estadoAnterior: SolicitudEstado | null
  estadoNuevo: SolicitudEstado
  observacionPublica: string | null
}

export type TipoSolicitudSeguimientoPublico = {
  nombre: string
  slug: string
}

/**
 * Respuesta de POST /solicitudes/seguimiento.
 * Contrato reducido: no incluye id, identificación, notaInterna, documentos ni firma.
 */
export type SeguimientoSolicitudPublico = {
  codigoSeguimiento: string
  estado: SolicitudEstado
  fechaIngreso: string
  tipoSolicitud: TipoSolicitudSeguimientoPublico | null
  historial: EventoSeguimientoPublico[]
}

export type ConsultarSeguimientoPayload = {
  codigo: string
  identificacion: string
}

export const CODIGO_SEGUIMIENTO_MAX = 50
export const IDENTIFICACION_SEGUIMIENTO_MAX = 30
export const CODIGO_SEGUIMIENTO_PATTERN = /^SOL-\d{4}-[A-Z0-9]+$/
