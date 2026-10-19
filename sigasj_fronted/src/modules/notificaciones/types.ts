export const TIPO_NOTIFICACION_AVERIA = {
  AVERIA_REGISTRADA_ADMINISTRADORA: 'AVERIA_REGISTRADA_ADMINISTRADORA',
  AVERIA_ASIGNADA_FONTANERO: 'AVERIA_ASIGNADA_FONTANERO',
  AVERIA_CLASIFICADA_ADMINISTRADORA: 'AVERIA_CLASIFICADA_ADMINISTRADORA',
  SOLICITUD_AUSENCIA_PENDIENTE_ADMINISTRADORA:
    'SOLICITUD_AUSENCIA_PENDIENTE_ADMINISTRADORA',
} as const

export type TipoNotificacionAveria =
  (typeof TIPO_NOTIFICACION_AVERIA)[keyof typeof TIPO_NOTIFICACION_AVERIA]

export type NotificacionAveriaItem = {
  id: number
  idAveria: number | null
  idSolicitudAusencia: number | null
  tipo: TipoNotificacionAveria | string
  titulo: string
  mensaje: string
  leida: boolean
  fechaCreacion: string
  fechaLectura: string | null
}

export type NotificacionesAveriaListado = {
  data: NotificacionAveriaItem[]
  noLeidas: number
}
