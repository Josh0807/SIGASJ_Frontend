import { ADMIN_BASE_PATH } from '../../app/router/adminPaths'

/** Segmento canónico de Recursos Humanos. */
export const RRHH_SEGMENT = 'rrhh'
/** Alias legacy (bookmarks, notificaciones antiguas). */
export const RRHH_LEGACY_SEGMENT = 'lecturas'

export const RRHH_PATH = `${ADMIN_BASE_PATH}/${RRHH_SEGMENT}`
export const RRHH_LEGACY_PATH = `${ADMIN_BASE_PATH}/${RRHH_LEGACY_SEGMENT}`
export const RRHH_TITLE = 'Recursos Humanos'

/** Reescribe `/admin/lecturas…` → `/admin/rrhh…` para auth y redirects. */
export const normalizeRrhhAdminPath = (path: string): string => {
  const [pathname, query = ''] = path.split('?')
  const normalized = pathname?.replace(/\/+$/, '') || pathname || path
  if (
    normalized === RRHH_LEGACY_PATH ||
    normalized.startsWith(`${RRHH_LEGACY_PATH}/`)
  ) {
    const suffix = normalized.slice(RRHH_LEGACY_PATH.length)
    return `${RRHH_PATH}${suffix}${query ? `?${query}` : ''}`
  }
  return path
}
export const COLABORADOR_NEW_PATH = `${RRHH_PATH}/nuevo`
export const colaboradorDetailPath = (id: number) => `${RRHH_PATH}/${id}`
export const colaboradorEditPath = (id: number) => `${RRHH_PATH}/${id}/editar`
export const colaboradorHistorialPath = (id: number) =>
  `${RRHH_PATH}/${id}/historial`

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

export const FONTANERO_MI_SALDO_PATH = '/fontanero/mi-saldo-vacaciones'
export const FONTANERO_MI_SALDO_TITLE = 'Mi saldo de vacaciones'

export const isFontaneroMiSaldoPath = (path: string) => {
  const normalized = path.split('?')[0]?.replace(/\/+$/, '') || path
  return (
    normalized === FONTANERO_MI_SALDO_PATH ||
    normalized.startsWith(`${FONTANERO_MI_SALDO_PATH}/`)
  )
}
