export const SOLICITUD_ESTADO_LABELS = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
} as const

export type SolicitudEstado = keyof typeof SOLICITUD_ESTADO_LABELS

export type SolicitudSeguimiento = {
  id: number
  tipoSolicitudId: number
  codigoSeguimiento: string
  estado: SolicitudEstado
  fechaIngreso: string
  createdAt: string
  updatedAt: string
  tipoSolicitud: {
    id: number
    nombre: string
    slug: string
  }
}
