export type Asociado = {
  id: number
  nombre: string
  apellidos: string
  cedula: string
  correoElectronico: string
  activo: boolean
  fechaRegistro: string
  fechaInactivacion: string | null
  motivoInactivacion: string | null
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

export type HistorialEstadoFiltro = 'todos' | 'activo' | 'inactivo'
export type HistorialOrden = 'ASC' | 'DESC'

export type HistorialAsociadosFiltros = {
  search: string
  estado: HistorialEstadoFiltro
  fechaRegistroDesde: string
  fechaRegistroHasta: string
  fechaInactivacionDesde: string
  fechaInactivacionHasta: string
  orden: HistorialOrden
  page: number
}

export type RegistrarAsociadoPayload = Pick<
  Asociado,
  'nombre' | 'apellidos' | 'cedula' | 'correoElectronico'
> & { fechaRegistro?: string }

export type ActualizarAsociadoPayload = Partial<
  Pick<Asociado, 'nombre' | 'apellidos' | 'cedula' | 'correoElectronico'>
>

export type AsociadoFormValues = Record<
  'nombre' | 'apellidos' | 'cedula' | 'correoElectronico',
  string
>
