export type TipoMovimientoInventario = 'ENTRADA' | 'SALIDA'

export type MovimientoMaterialResumen = {
  id: number
  nombre: string
  unidadMedida: string
}

export type MovimientoUsuarioResumen = {
  id: number
  nombre: string | null
}

export type MovimientoReferenciaResumen = {
  id: number
  codigo?: string | null
}

export type MovimientoInventario = {
  id: number
  tipo: TipoMovimientoInventario
  cantidad: number
  fechaMovimiento: string
  createdAt?: string
  observacion?: string | null
  referencia?: string | null
  idMaterial: number
  idUsuario: number
  idProveedor?: number | null
  idAveria?: number | null
  idSolicitud?: number | null
  idReposicion?: number | null
  idProyecto?: number | null
  material?: MovimientoMaterialResumen | null
  usuario?: MovimientoUsuarioResumen | null
  proveedor?: MovimientoReferenciaResumen & { nombre?: string | null } | null
  averia?: MovimientoReferenciaResumen | null
  solicitudMaterial?: MovimientoReferenciaResumen | null
  reposicion?: MovimientoReferenciaResumen | null
  documentos?: {
    id: number
    nombreOriginal: string
    tipoArchivo: string
    createdAt?: string
  }[]
}

export type MovimientosQuery = {
  page?: number
  limit?: number
  tipo?: TipoMovimientoInventario | ''
  idMaterial?: number
  idUsuario?: number
  fechaDesde?: string
  fechaHasta?: string
}

export type MovimientosListResponse = {
  data: MovimientoInventario[]
  total: number
  page: number
  limit: number
  totalPages: number
}
