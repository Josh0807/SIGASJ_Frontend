import { ADMIN_BASE_PATH } from '../../../app/router/adminPaths'

export const AVERIAS_ADMIN_PATH = `${ADMIN_BASE_PATH}/averias`

export const AVERIAS_ADMIN_HISTORIAL_PATH = `${AVERIAS_ADMIN_PATH}/historial`

export const AVERIAS_ADMIN_REPORTE_PATH = `${AVERIAS_ADMIN_PATH}/reportes/resumen`

export const averiasAdminDetailPath = (id: number | string) =>
  `${AVERIAS_ADMIN_PATH}/${id}`
