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

export const INCAPACIDADES_PATH = `${RRHH_PATH}/incapacidades`
export const INCAPACIDAD_NEW_PATH = `${INCAPACIDADES_PATH}/nuevo`
export const incapacidadDetailPath = (id: number) => `${INCAPACIDADES_PATH}/${id}`
export const incapacidadEditPath = (id: number) => `${INCAPACIDADES_PATH}/${id}/editar`

export const VACACIONES_PATH = `${RRHH_PATH}/vacaciones`
export const vacacionesColaboradorPath = (colaboradorId: number) =>
  `${VACACIONES_PATH}?colaboradorId=${colaboradorId}`
