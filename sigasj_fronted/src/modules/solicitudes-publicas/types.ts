export const SOLICITUD_ESTADO_LABELS = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
} as const

export type SolicitudEstado = keyof typeof SOLICITUD_ESTADO_LABELS

/** @deprecated Preferir SeguimientoSolicitudPublico (contrato 4.14.1). */
export type SolicitudSeguimiento = {
  codigoSeguimiento: string
  estado: SolicitudEstado
  fechaIngreso: string
  tipoSolicitud: {
    nombre: string
    slug: string
  } | null
  historial?: Array<{
    fecha: string
    estadoAnterior: SolicitudEstado | null
    estadoNuevo: SolicitudEstado
    observacionPublica: string | null
  }>
}
