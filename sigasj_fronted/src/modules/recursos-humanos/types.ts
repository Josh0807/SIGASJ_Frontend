export type ColaboradorUsuario = {
  idUsuario: number
  nombre: string
  correo: string
  activo: boolean
}

export type Colaborador = {
  id: number
  nombre: string
  apellidos: string
  cedula: string
  correoElectronico: string
  cargo: string
  activo: boolean
  usuarioId: number | null
  usuario?: ColaboradorUsuario | null
  createdAt: string
  updatedAt: string
}

export type ColaboradoresListado = {
  data: Colaborador[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type EstadoFiltro = 'todos' | 'activos' | 'inactivos'

export type ColaboradoresFiltros = {
  search: string
  cargo: string
  estado: EstadoFiltro
  page: number
}

export type ColaboradorFormValues = {
  nombre: string
  apellidos: string
  cedula: string
  correoElectronico: string
  cargo: string
  usuarioId: string
}

export type ColaboradorPayload = {
  nombre: string
  apellidos: string
  cedula: string
  correoElectronico: string
  cargo: string
  usuarioId?: number | null
}

export type CuentaUsuario = {
  id: number
  nombre: string
  correo: string
  rol: string
  activo: boolean
}
