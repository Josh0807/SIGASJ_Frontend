import type { ResumenDiasVacaciones } from './feriadosCostaRica'

export type TipoSolicitudAusencia = 'PERMISO' | 'VACACIONES'
export type EstadoSolicitudAusencia = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'

export type ColaboradorResumenAusencia = {
  id: number
  nombre: string
  apellidos: string
  cedula: string
  cargo: string
  correoElectronico?: string
  activo?: boolean
}

export type DocumentoSolicitudAusencia = {
  id: number
  nombreOriginal: string
  tipoArchivo: string
  rutaReferenciaArchivo: string
  tamanio: number
  fechaCarga: string
}

/** Vista Fontanero (API 6.5.3). Sin jotformSubmissionId ni datos de revisor internos. */
export type SolicitudAusenciaFontanero = {
  id: number
  tipo: TipoSolicitudAusencia
  fechaInicio: string
  fechaFin: string
  motivo: string | null
  correoNotificacion: string | null
  observaciones: string | null
  estado: EstadoSolicitudAusencia
  motivoRechazo: string | null
  reviewedAt: string | null
  documentos?: DocumentoSolicitudAusencia[]
  resumenVacaciones?: ResumenDiasVacaciones | null
  createdAt: string
  updatedAt: string
}

export type SolicitudAusencia = {
  id: number
  colaboradorId: number
  colaborador?: ColaboradorResumenAusencia
  tipo: TipoSolicitudAusencia
  fechaInicio: string
  fechaFin: string
  motivo: string | null
  correoNotificacion?: string | null
  estado: EstadoSolicitudAusencia
  jotformSubmissionId: string
  reviewedAt: string | null
  reviewedByUsuarioId: number | null
  motivoRechazo: string | null
  registroGeneradoId: number | null
  registroGeneradoTipo: 'PERMISO' | 'MOVIMIENTO_VACACIONES' | null
  createdAt: string
  updatedAt: string
  documentos?: DocumentoSolicitudAusencia[]
  resumenVacaciones?: ResumenDiasVacaciones | null
  saldoVacaciones?: {
    diasAcumulados: number
    diasDisfrutados: number
    diasDisponibles: number
  } | null
}

export type SolicitudesAusenciaListado = {
  data: SolicitudAusencia[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type CorrelacionAusencia = {
  token: string
  expiresAt: string
  colaboradorId: number
  formId: string
}
