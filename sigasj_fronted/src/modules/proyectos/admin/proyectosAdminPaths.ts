import { ADMIN_BASE_PATH } from '../../../app/router/adminPaths'

export const PROYECTOS_ADMIN_PATH = `${ADMIN_BASE_PATH}/proyectos`

export const PROYECTOS_ADMIN_NEW_PATH = `${PROYECTOS_ADMIN_PATH}/nuevo`

export const proyectosAdminDetailPath = (id: number) =>
  `${PROYECTOS_ADMIN_PATH}/${id}`

export const proyectosAdminEditPath = (id: number) =>
  `${PROYECTOS_ADMIN_PATH}/${id}/editar`

export const proyectosAdminImagesPath = (id: number) =>
  `${PROYECTOS_ADMIN_PATH}/${id}/imagenes`

/**
 * Las pantallas de detalle y gestión de imágenes todavía no están
 * registradas. Alta y edición sí: /nuevo y /:id/editar.
 */
export const PROYECTOS_ADMIN_PENDING_ACTION_ROUTES = [
  'ver',
  'imagenes',
] as const

/**
 * Backlog de proyectos: el DTO de cambio de estado existe en el Backend,
 * pero la ruta PATCH /api/v1/admin/proyectos/:id/estado no está cableada.
 * No mezclar `estado` con PATCH /api/v1/admin/proyectos/:id.
 */
export const PROYECTOS_ADMIN_PENDING_INTEGRATIONS = [
  'cambio-estado',
] as const
