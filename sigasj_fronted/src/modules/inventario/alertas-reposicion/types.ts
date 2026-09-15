export const ESTADOS_ALERTA_REPOSICION = ['PENDIENTE', 'EN_GESTION', 'RESUELTA'] as const

export type EstadoAlertaReposicion = (typeof ESTADOS_ALERTA_REPOSICION)[number]

export type AlertaReposicionMaterial = {
  id: number
  nombre: string
  unidadMedida: string
}

export type AlertaReposicionUsuario = {
  id: number
  nombre: string | null
}

export type AlertaReposicion = {
  id: number
  idMaterial: number
  stockActual: number
  stockMinimo: number
  estado: EstadoAlertaReposicion | string
  fechaGeneracion: string
  updatedAt?: string
  idUsuarioGestiona: number | null
  material: AlertaReposicionMaterial | null
  usuarioGestiona: AlertaReposicionUsuario | null
}

export type AlertasReposicionQuery = {
  estado?: EstadoAlertaReposicion | ''
  page?: number
  limit?: number
}

export type AlertasReposicionListResponse = {
  data: AlertaReposicion[]
  total: number
  page: number
  limit: number
  totalPages: number
} | AlertaReposicion[]
