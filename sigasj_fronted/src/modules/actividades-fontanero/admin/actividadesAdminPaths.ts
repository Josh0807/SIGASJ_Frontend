/** Rutas administrativas del módulo (revisión / reportes / dashboard). */
export const ACTIVIDADES_ADMIN_BASE_PATH = '/admin/actividades-fontanero'

export const ACTIVIDADES_ADMIN_PATHS = {
  home: ACTIVIDADES_ADMIN_BASE_PATH,
  dashboard: `${ACTIVIDADES_ADMIN_BASE_PATH}/dashboard`,
  reportes: `${ACTIVIDADES_ADMIN_BASE_PATH}/reportes`,
} as const
