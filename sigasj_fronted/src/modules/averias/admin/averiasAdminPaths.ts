import { ADMIN_BASE_PATH } from '../../../app/router/adminPaths'

export const AVERIAS_ADMIN_PATH = `${ADMIN_BASE_PATH}/averias`

export const averiasAdminDetailPath = (id: number | string) =>
  `${AVERIAS_ADMIN_PATH}/${id}`
