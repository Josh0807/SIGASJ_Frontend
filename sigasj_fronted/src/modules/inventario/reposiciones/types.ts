export const ESTADOS_REPOSICION = [
  'PENDIENTE',
  'EN_GESTION',
  'COMPRA_REGISTRADA',
  'PENDIENTE_RECEPCION',
  'RECIBIDA',
  'COMPLETADA',
] as const

export const ORIGENES_REPOSICION = [
  'ALERTA_STOCK_MINIMO',
  'SOLICITUD_APROBADA',
  'ADMINISTRATIVA',
] as const

export type EstadoReposicion = (typeof ESTADOS_REPOSICION)[number]
export type OrigenReposicion = (typeof ORIGENES_REPOSICION)[number]

export type ReposicionMaterialItem = {
  id: number
  nombre: string
  unidadMedida: string
  stockActual?: number
}

export type ReposicionDetalle = {
  id: number
  idMaterial: number
  cantidad: number
  observacion?: string | null
  material: ReposicionMaterialItem | null
}

export type ReposicionProveedor = {
  id: number
  nombre: string | null
}

export type ReposicionUsuario = {
  id: number
  nombre: string | null
}

export type ReposicionMaterial = {
  id: number
  codigo: string | null
  fechaGeneracion: string
  origen: OrigenReposicion | string
  estado: EstadoReposicion | string
  idAlertaReposicion: number | null
  idSolicitudMaterial: number | null
  idUsuarioResponsable: number
  idProveedor: number | null
  fechaCompra: string | null
  observacion: string | null
  updatedAt?: string
  proveedor: ReposicionProveedor | null
  usuarioResponsable: ReposicionUsuario | null
  alertaReposicion: { id: number } | null
  solicitudMaterial: { id: number } | null
  detalles: ReposicionDetalle[]
}

export type ReposicionesQuery = {
  estado?: EstadoReposicion | ''
  origen?: OrigenReposicion | ''
  page?: number
  limit?: number
}

export type ReposicionesListResponse = {
  data: ReposicionMaterial[]
  total: number
  page: number
  limit: number
  totalPages: number
} | ReposicionMaterial[]
