export type Material = {
  id: number
  nombre: string
  descripcion: string | null
  unidadMedida: string
  ubicacion: string | null
  stockMinimo: number
  stockActual: number
  activo: boolean
  idCategoria: number | null
  categoria: { id: number; nombre: string; descripcion: string | null; activo: boolean } | null
  idProveedor: number | null
  proveedor: { id: number; nombre: string; telefono: string | null; correo: string | null; activo: boolean } | null
  createdAt: string
  updatedAt: string
}

export type MaterialesResponse = {
  data: Material[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type MaterialesQuery = {
  page?: number
  limit?: number
  nombre?: string
  activo?: boolean
  idCategoria?: number
  idProveedor?: number
}

export type UpdateMaterialPayload = Pick<Material, 'nombre' | 'unidadMedida' | 'descripcion' | 'ubicacion' | 'stockMinimo' | 'activo'> & { idCategoria: number | null; idProveedor: number | null }

export type CreateMaterialPayload = Omit<UpdateMaterialPayload, 'activo'>
export type MaterialFormValues = {
  nombre: string
  descripcion: string
  unidadMedida: string
  ubicacion: string
  stockMinimo: string
  activo: boolean
  categoriaId: string
  proveedorId: string
}
