import { RRHH_PATH } from '../recursos-humanos/recursosHumanosPaths'

export const FONTANERO_SOLICITAR_AUSENCIA_PATH = '/fontanero/solicitar-ausencia'
export const FONTANERO_SOLICITAR_AUSENCIA_TITLE = 'Solicitar permiso o vacaciones'

export const FONTANERO_MIS_SOLICITUDES_PATH = '/fontanero/mis-solicitudes'
export const FONTANERO_MIS_SOLICITUDES_TITLE = 'Mis solicitudes'

export const isFontaneroSolicitarAusenciaPath = (path: string): boolean => {
  const normalized = path.replace(/\/+$/, '') || '/'
  return (
    normalized === FONTANERO_SOLICITAR_AUSENCIA_PATH ||
    normalized.startsWith(`${FONTANERO_SOLICITAR_AUSENCIA_PATH}/`)
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
