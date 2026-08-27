import {
  ESTADOS_PROYECTO,
  ESTADO_PROYECTO_LABELS,
  ESTADO_PROYECTO_OPTIONS,
  PROYECTO_ESTADO_UPDATE_PENDING,
  isEstadoProyecto,
  type EstadoProyecto,
} from '../types/estadoProyecto'

export {
  ESTADOS_PROYECTO,
  ESTADO_PROYECTO_LABELS,
  ESTADO_PROYECTO_OPTIONS,
  PROYECTO_ESTADO_UPDATE_PENDING,
  isEstadoProyecto,
}

export type { EstadoProyecto }

export type AdminProyecto = {
  id: number
  nombre: string
  descripcion: string | null
  encargadoRealizacion: string | null
  duracion: string | null
  estado: EstadoProyecto
  imagenPrincipal: string | null
  activo: boolean
  createdAt: string
  updatedAt: string
}

export type AdminProyectoImagen = {
  id: number
  url: string
  descripcion: string | null
  orden: number
  createdAt: string
}

export type AdminProyectoDetalle = AdminProyecto & {
  imagenes: AdminProyectoImagen[]
}

export type ProyectosAdminListado = {
  data: AdminProyecto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type QueryProyectosAdmin = {
  nombre?: string
  estado?: EstadoProyecto
  activo?: boolean
  page?: number
  limit?: number
}

export const DEFAULT_PROYECTOS_PAGE = 1
export const DEFAULT_PROYECTOS_LIMIT = 10

export const clampProyectosPage = (page: number, totalPages: number): number => {
  if (totalPages < 1) {
    return DEFAULT_PROYECTOS_PAGE
  }

  return Math.min(totalPages, Math.max(DEFAULT_PROYECTOS_PAGE, page))
}

export const EMPTY_PROYECTOS_LISTADO: ProyectosAdminListado = {
  data: [],
  total: 0,
  page: DEFAULT_PROYECTOS_PAGE,
  limit: DEFAULT_PROYECTOS_LIMIT,
  totalPages: 0,
}

export type ProyectoFormValues = {
  nombre: string
  descripcion: string
  encargadoRealizacion: string
  duracion: string
  estado: EstadoProyecto | ''
}

export type ProyectoFormField = keyof ProyectoFormValues

export const emptyProyectoFormValues = (): ProyectoFormValues => ({
  nombre: '',
  descripcion: '',
  encargadoRealizacion: '',
  duracion: '',
  estado: '',
})

export const toProyectoFormValues = (
  proyecto: Pick<
    AdminProyecto,
    'nombre' | 'descripcion' | 'encargadoRealizacion' | 'duracion' | 'estado'
  >,
): ProyectoFormValues => ({
  nombre: proyecto.nombre ?? '',
  descripcion: proyecto.descripcion ?? '',
  encargadoRealizacion: proyecto.encargadoRealizacion ?? '',
  duracion: proyecto.duracion ?? '',
  estado: proyecto.estado,
})
