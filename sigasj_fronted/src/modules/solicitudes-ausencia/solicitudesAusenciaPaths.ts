import { RRHH_PATH } from '../recursos-humanos/recursosHumanosPaths'

export const FONTANERO_SOLICITAR_AUSENCIA_PATH = '/fontanero/solicitar-ausencia'
export const FONTANERO_SOLICITAR_AUSENCIA_TITLE = 'Solicitar permiso o vacaciones'

export const FONTANERO_SOLICITAR_PERMISO_PATH = '/fontanero/solicitar-permiso'
export const FONTANERO_SOLICITAR_PERMISO_TITLE = 'Solicitar permiso'

export const FONTANERO_SOLICITAR_VACACIONES_PATH =
  '/fontanero/solicitar-vacaciones'
export const FONTANERO_SOLICITAR_VACACIONES_TITLE = 'Solicitar vacaciones'

export const FONTANERO_MIS_SOLICITUDES_PATH = '/fontanero/mis-solicitudes'
export const FONTANERO_MIS_SOLICITUDES_TITLE = 'Mis solicitudes'

const FONTANERO_SOLICITAR_PATHS = [
  FONTANERO_SOLICITAR_AUSENCIA_PATH,
  FONTANERO_SOLICITAR_PERMISO_PATH,
  FONTANERO_SOLICITAR_VACACIONES_PATH,
] as const

export const isFontaneroSolicitarAusenciaPath = (path: string): boolean => {
  const normalized = path.replace(/\/+$/, '') || '/'
  return FONTANERO_SOLICITAR_PATHS.some(
    (base) => normalized === base || normalized.startsWith(`${base}/`),
  )
}

export const isFontaneroMisSolicitudesPath = (path: string): boolean => {
  const normalized = path.replace(/\/+$/, '') || '/'
  return (
    normalized === FONTANERO_MIS_SOLICITUDES_PATH ||
    normalized.startsWith(`${FONTANERO_MIS_SOLICITUDES_PATH}/`)
  )
}

export const misSolicitudAusenciaDetailPath = (id: number) =>
  `${FONTANERO_MIS_SOLICITUDES_PATH}/${id}`

export const SOLICITUDES_AUSENCIA_ADMIN_PATH = `${RRHH_PATH}/solicitudes-ausencia`
export const solicitudAusenciaDetailPath = (id: number) =>
  `${SOLICITUDES_AUSENCIA_ADMIN_PATH}/${id}`

/** Cola y detalle administrativo de ausencia (PBI 6.5.4 — solo Administradora). */
export const isSolicitudesAusenciaAdminPath = (path: string): boolean => {
  const normalized = path.split('?')[0]?.replace(/\/+$/, '') || path
  return (
    normalized === SOLICITUDES_AUSENCIA_ADMIN_PATH ||
    normalized.startsWith(`${SOLICITUDES_AUSENCIA_ADMIN_PATH}/`)
  )
}
