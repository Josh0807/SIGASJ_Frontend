export type Asociado = {
  id: number
  nombre: string
  apellidos: string
  cedula: string
  correoElectronico: string
  activo: boolean
  fechaRegistro: string
  fechaInactivacion: string | null
  createdAt: string
  updatedAt: string
}

export type AsociadosListado = {
  data: Asociado[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type EstadoFiltro = 'todos' | 'activos' | 'inactivos'

export type AsociadosFiltros = {
  search: string
  estado: EstadoFiltro
  page: number
}

export type RegistrarAsociadoPayload = Pick<
  Asociado,
  'nombre' | 'apellidos' | 'cedula' | 'correoElectronico'
> & { fechaRegistro?: string }

export type AsociadoFormValues = Record<
  'nombre' | 'apellidos' | 'cedula' | 'correoElectronico',
  string
>
