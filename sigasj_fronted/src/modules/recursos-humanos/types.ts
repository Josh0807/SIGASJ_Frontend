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

export type PermisoColaboradorResumen = Pick<
  Colaborador,
  'id' | 'nombre' | 'apellidos' | 'cedula' | 'cargo' | 'activo'
>

export type PermisoColaborador = {
  id: number
  colaboradorId: number
  fechaInicio: string
  fechaFin: string
  motivo: string
  observaciones: string | null
  colaborador?: PermisoColaboradorResumen | null
  createdAt: string
  updatedAt: string
}

export type PermisosListado = {
  data: PermisoColaborador[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type PermisosFiltros = {
  colaboradorId: string
  fechaInicio: string
  fechaFin: string
  page: number
}

export type PermisoFormValues = {
  colaboradorId: string
  fechaInicio: string
  fechaFin: string
  motivo: string
  observaciones: string
}

export type PermisoPayload = {
  colaboradorId: number
  fechaInicio: string
  fechaFin: string
  motivo: string
  observaciones?: string | null
}

export type Incapacidad = {
  id: number
  colaboradorId: number
  fechaInicio: string
  fechaFin: string
  observaciones: string | null
  colaborador?: PermisoColaboradorResumen | null
  createdAt: string
  updatedAt: string
}

export type IncapacidadesListado = {
  data: Incapacidad[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type IncapacidadesFiltros = {
  colaboradorId: string
  fechaInicio: string
  fechaFin: string
  page: number
}

export type IncapacidadFormValues = {
  colaboradorId: string
  fechaInicio: string
  fechaFin: string
  observaciones: string
}

export type IncapacidadPayload = {
  colaboradorId: number
  fechaInicio: string
  fechaFin: string
  observaciones?: string | null
}

export type TipoMovimientoVacaciones = 'ACUMULADO' | 'DISFRUTADO'

export type MovimientoVacaciones = {
  id: number
  colaboradorId: number
  tipo: TipoMovimientoVacaciones
  cantidadDias: number
  fecha: string
  observaciones: string | null
  colaborador?: PermisoColaboradorResumen | null
  createdAt: string
}

export type BalanceVacaciones = {
  colaboradorId: number
  colaborador: PermisoColaboradorResumen
  diasAcumulados: number
  diasDisfrutados: number
  diasDisponibles: number
  totalMovimientos: number
}

export type MovimientosVacacionesListado = {
  data: MovimientoVacaciones[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type MovimientosVacacionesFiltros = {
  colaboradorId: string
  tipo: TipoMovimientoVacaciones | ''
  fechaInicio: string
  fechaFin: string
  page: number
}

export type MovimientoVacacionesFormValues = {
  tipo: TipoMovimientoVacaciones | ''
  cantidadDias: string
  fecha: string
  observaciones: string
}

export type MovimientoVacacionesPayload = {
  colaboradorId: number
  tipo: TipoMovimientoVacaciones
  cantidadDias: number
  fecha: string
  observaciones?: string | null
}

export type TipoEventoHistorialRrhh = 'PERMISO' | 'VACACION' | 'INCAPACIDAD'

export type HistorialColaboradorResumen = {
  id: number
  nombre: string
  apellidos: string
  cedula: string
  cargo: string
}

export type EventoHistorialColaborador = {
  id: number
  tipo: TipoEventoHistorialRrhh
  fecha: string
  fechaInicio: string | null
  fechaFin: string | null
  descripcion: string
  motivo?: string | null
  tipoMovimiento?: TipoMovimientoVacaciones
  cantidadDias?: number
  observaciones?: string | null
}

export type HistorialColaboradorRespuesta = {
  colaborador: HistorialColaboradorResumen
  historial: EventoHistorialColaborador[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type HistorialColaboradorFiltros = {
  tipo: TipoEventoHistorialRrhh | ''
  fechaDesde: string
  fechaHasta: string
  page: number
}
