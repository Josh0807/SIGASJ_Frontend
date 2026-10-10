import { ADMIN_BASE_PATH } from '../../app/router/adminPaths'

/** El módulo usa el segmento `lecturas` que ya reserva el menú para Recursos Humanos. */
export const RRHH_PATH = `${ADMIN_BASE_PATH}/lecturas`
export const RRHH_TITLE = 'Recursos Humanos'
export const COLABORADOR_NEW_PATH = `${RRHH_PATH}/nuevo`
export const colaboradorDetailPath = (id: number) => `${RRHH_PATH}/${id}`
export const colaboradorEditPath = (id: number) => `${RRHH_PATH}/${id}/editar`

export const PERMISOS_PATH = `${RRHH_PATH}/permisos`
export const PERMISO_NEW_PATH = `${PERMISOS_PATH}/nuevo`
export const permisoDetailPath = (id: number) => `${PERMISOS_PATH}/${id}`
export const permisoEditPath = (id: number) => `${PERMISOS_PATH}/${id}/editar`
