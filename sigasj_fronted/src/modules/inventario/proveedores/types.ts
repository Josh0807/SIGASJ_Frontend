export type Proveedor = {
  id: number
  nombre: string
  razonSocial: string | null
  identificacion: string | null
  telefono: string | null
  correo: string | null
  direccion: string | null
  personaContacto: string | null
  activo: boolean
  createdAt: string
  updatedAt: string
}

export type ProveedoresResponse = {
  data: Proveedor[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ProveedoresQuery = { page?: number; limit?: number; nombre?: string; search?: string; activo?: boolean }
export type ProveedorPayload = Pick<Proveedor, 'nombre' | 'razonSocial' | 'identificacion' | 'telefono' | 'correo' | 'direccion' | 'personaContacto'>
export type UpdateProveedorPayload = Partial<ProveedorPayload>
export type ProveedorFormValues = { [K in keyof ProveedorPayload]: string }
