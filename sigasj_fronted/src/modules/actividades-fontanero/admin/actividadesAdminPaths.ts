/** Rutas administrativas del módulo (revisión / reportes / dashboard). */
export const ACTIVIDADES_ADMIN_BASE_PATH = '/admin/actividades-fontanero'

export const ACTIVIDADES_ADMIN_PATHS = {
  home: ACTIVIDADES_ADMIN_BASE_PATH,
  revision: ACTIVIDADES_ADMIN_BASE_PATH,
  dashboard: `${ACTIVIDADES_ADMIN_BASE_PATH}/dashboard`,
  reportes: `${ACTIVIDADES_ADMIN_BASE_PATH}/reportes`,
} as const

export const actividadAdminDetallePath = (actividadId: number | string) =>
  `${ACTIVIDADES_ADMIN_BASE_PATH}/${actividadId}`
