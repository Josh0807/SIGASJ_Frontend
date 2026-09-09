/** Ruta operativa del módulo (equivalente a /fontanero/actividades del backlog). */
export const ACTIVIDADES_FONTANERO_BASE_PATH = '/admin/actividades'

export const ACTIVIDADES_FONTANERO_PATHS = {
  home: ACTIVIDADES_FONTANERO_BASE_PATH,
  dashboard: `${ACTIVIDADES_FONTANERO_BASE_PATH}/dashboard`,
  /** Alias de backlog: /fontanero/actividades/nueva */
  nueva: `${ACTIVIDADES_FONTANERO_BASE_PATH}/nueva`,
  registrar: `${ACTIVIDADES_FONTANERO_BASE_PATH}/registrar`,
  registrarTipo: (tipoCodigo: string) =>
    `${ACTIVIDADES_FONTANERO_BASE_PATH}/nueva/${tipoCodigo}`,
  /** Alias de backlog: /fontanero/actividades/historial */
  historial: `${ACTIVIDADES_FONTANERO_BASE_PATH}/historial`,
  historialDetalle: (actividadId: number | string) =>
    `${ACTIVIDADES_FONTANERO_BASE_PATH}/historial/${actividadId}`,
  misActividades: `${ACTIVIDADES_FONTANERO_BASE_PATH}/mis-actividades`,
  correcciones: `${ACTIVIDADES_FONTANERO_BASE_PATH}/correcciones`,
  corregirActividad: (actividadId: number | string) =>
    `${ACTIVIDADES_FONTANERO_BASE_PATH}/correcciones/${actividadId}/corregir`,
} as const
