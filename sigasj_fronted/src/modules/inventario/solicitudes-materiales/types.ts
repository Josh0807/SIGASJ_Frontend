import type { Material } from '../types'

export type SolicitudMaterialItemPayload = {
  idMaterial: number
  cantidad: number
  observacion?: string
}

export type CreateSolicitudMaterialesPayload = {
  idAveria?: number
  motivo?: string
  materiales: SolicitudMaterialItemPayload[]
}

export type SolicitudMaterialDetalle = {
  id: number
  idSolicitud: number
  idMaterial: number
  cantidad: number
  observacion: string | null
  material?: Pick<Material, 'id' | 'nombre' | 'unidadMedida' | 'stockActual'>
}

export type SolicitudMateriales = {
  id: number
  codigo: string
  fechaSolicitud: string
  estado: string
  idFontanero: number
  idAveria: number | null
  observacion: string | null
  detalles: SolicitudMaterialDetalle[]
  cantidadMateriales?: number
  totalMateriales?: number
  averia?: {
    id?: number
    codigo?: string
    numero?: string
    referencia?: string
    codigoSeguimiento?: string
  } | null
  fontanero?: {
    id?: number
    nombre?: string | null
  } | null
}

export type SolicitudMaterialesListItem = Omit<SolicitudMateriales, 'detalles'> & {
  detalles?: SolicitudMaterialDetalle[]
}

export type SolicitudesMaterialesListResponse =
  | SolicitudMaterialesListItem[]
  | {
      data: SolicitudMaterialesListItem[]
      total?: number
      page?: number
      limit?: number
      totalPages?: number
    }

export type SolicitudesMaterialesQuery = {
  estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
  idAveria?: number
  page?: number
  limit?: number
}

export type SolicitudMaterialFormRow = {
  key: string
  materialId: string
  cantidad: string
  observacion: string
}

export type SolicitudMaterialFormErrors = {
  form?: string
  motivo?: string
  rows: Record<string, { materialId?: string; cantidad?: string; observacion?: string }>
}
