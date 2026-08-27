/**
 * Contrato de estado de ejecución de Proyecto (Backend `EstadoProyecto`).
 * Valores internos: PENDIENTE, EN_PROCESO, COMPLETADO.
 * Etiquetas visibles: Pendiente, En proceso, Completado.
 */
export const ESTADOS_PROYECTO = [
  'PENDIENTE',
  'EN_PROCESO',
  'COMPLETADO',
] as const

export type EstadoProyecto = (typeof ESTADOS_PROYECTO)[number]

export const ESTADO_PROYECTO_LABELS: Record<EstadoProyecto, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  COMPLETADO: 'Completado',
}

export const ESTADO_PROYECTO_OPTIONS = ESTADOS_PROYECTO.map((value) => ({
  value,
  label: ESTADO_PROYECTO_LABELS[value],
}))

export const isEstadoProyecto = (value: string): value is EstadoProyecto =>
  ESTADOS_PROYECTO.includes(value as EstadoProyecto)

/**
 * El Backend define `UpdateProyectoEstadoDto` pero no cablea
 * PATCH /api/v1/admin/proyectos/:id/estado. Hasta esa integración, el
 * selector de edición muestra el estado actual y no se envía `estado` en
 * PATCH /api/v1/admin/proyectos/:id.
 */
export const PROYECTO_ESTADO_UPDATE_PENDING = true
