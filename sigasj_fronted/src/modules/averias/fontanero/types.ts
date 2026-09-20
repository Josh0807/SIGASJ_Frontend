import type { EstadoAveria } from '../admin/estadoAveria'

export type AveriaObservacionItem = {
  id: number
  observacion: string
  fechaCreacion: string
  autor: {
    id: number
    nombre: string
  }
}

export type AveriaFontaneroListItem = {
  id: number
  codigoSeguimiento: string
  fechaAsignacion: string | null
  estado: EstadoAveria | string
  sectorComunidad: string
  ubicacion: string
  descripcion: string
  tipoAveria: string
  prioridad: string
  fechaInicioAtencion: string | null
}

export type AveriasFontaneroListado = {
  data: AveriaFontaneroListItem[]
}

/**
 * Contrato de GET /api/v1/fontanero/averias/:id (`AveriaFontaneroDetail`).
 * El Backend sustituye algunos nulos por textos de presentación.
 */
export type AveriaFontaneroDetail = {
  id: number
  codigoSeguimiento: string
  fechaReporte: string
  fechaAsignacion: string | null
  estado: EstadoAveria | string
  sectorComunidad: string
  ubicacion: string
  descripcion: string
  nombreReportante: string
  telefonoReportante: string
  tipoAveria: string
  prioridad: string
  fechaInicioAtencion: string | null
  fechaResolucion: string | null
  observacionesAtencion: string
  observaciones?: AveriaObservacionItem[]
}

export type ResolverAveriaResponse = {
  message: string
  data: AveriaFontaneroDetail
}

export type CreateObservacionAveriaResponse = {
  message: string
  data: AveriaObservacionItem
}

export const AVERIAS_FONTANERO_DETAIL_LOADING_MESSAGE =
  'Cargando información de la avería...'

export const AVERIAS_FONTANERO_DETAIL_ERROR =
  'No fue posible cargar la avería. Intente nuevamente.'

export const AVERIAS_FONTANERO_DETAIL_NOT_FOUND =
  'No se encontró la avería solicitada.'

export const AVERIAS_FONTANERO_DETAIL_FORBIDDEN =
  'No tiene autorización para consultar esta avería.'

export const AVERIAS_FONTANERO_BACK_LABEL = 'Volver a mis averías'

export const AVERIAS_FONTANERO_NO_ACTIONS =
  'No hay acciones operativas disponibles para este estado.'

export const AVERIAS_FONTANERO_INICIAR_LABEL = 'Iniciar atención'

export const AVERIAS_FONTANERO_INICIAR_LOADING = 'Iniciando atención...'

export const AVERIAS_FONTANERO_INICIAR_SUCCESS =
  'La atención se inició correctamente.'

export const AVERIAS_FONTANERO_INICIAR_ERROR =
  'No fue posible iniciar la atención. Intente nuevamente.'

export const AVERIAS_FONTANERO_INICIAR_FORBIDDEN =
  'No tiene autorización para iniciar la atención de esta avería.'

export const AVERIAS_FONTANERO_ATENCION_NO_INICIADA =
  'La atención todavía no ha comenzado.'

export const AVERIAS_FONTANERO_OBSERVACIONES_VACIAS =
  'Sin observaciones registradas.'

export const AVERIAS_FONTANERO_OBSERVACIONES_TITULO =
  'Observaciones de atención'

export const AVERIAS_FONTANERO_OBSERVACIONES_LISTA_VACIA =
  'No hay observaciones registradas para esta avería.'

export const AVERIAS_FONTANERO_OBSERVACION_NUEVA_LABEL = 'Nueva observación'

export const AVERIAS_FONTANERO_OBSERVACION_PLACEHOLDER =
  'Escriba aquí la información de la atención...'

export const AVERIAS_FONTANERO_OBSERVACION_GUARDAR = 'Guardar observación'

export const AVERIAS_FONTANERO_OBSERVACION_LOADING = 'Guardando observación...'

export const AVERIAS_FONTANERO_OBSERVACION_VACIA =
  'Escriba una observación antes de guardar.'

export const AVERIAS_FONTANERO_OBSERVACION_SUCCESS =
  'Observación registrada correctamente.'

export const AVERIAS_FONTANERO_OBSERVACION_ERROR =
  'No fue posible guardar la observación. Intente nuevamente.'

export const AVERIAS_FONTANERO_OBSERVACION_FORBIDDEN =
  'No tiene autorización para registrar observaciones en esta avería.'

export const AVERIAS_FONTANERO_LIST_EMPTY =
  'No tiene averías asignadas pendientes de atención.'

export const AVERIAS_FONTANERO_LIST_LOADING =
  'Cargando averías asignadas...'

export const AVERIAS_FONTANERO_LIST_ERROR =
  'No fue posible cargar las averías asignadas. Intente nuevamente.'

export const AVERIAS_FONTANERO_RESOLVER_LABEL = 'Marcar como resuelta'

export const AVERIAS_FONTANERO_RESOLVER_TITLE = 'Confirmar resolución'

export const AVERIAS_FONTANERO_RESOLVER_HINT =
  'Al confirmar, la avería será marcada como resuelta. Verifique que la atención haya finalizado.'

export const AVERIAS_FONTANERO_RESOLVER_FIELD_LABEL =
  'Observación final de la atención'

export const AVERIAS_FONTANERO_RESOLVER_CONFIRM = 'Confirmar resolución'

export const AVERIAS_FONTANERO_RESOLVER_CANCEL = 'Cancelar'

export const AVERIAS_FONTANERO_RESOLVER_LOADING = 'Guardando resolución...'

export const OBSERVACION_FINAL_VACIA =
  'Registre una observación sobre la atención realizada antes de resolver la avería.'

export const AVERIAS_FONTANERO_RESOLVER_ERROR =
  'No fue posible completar la resolución de la avería. Intente nuevamente.'

export const AVERIAS_FONTANERO_RESOLVER_FORBIDDEN =
  'No tiene autorización para resolver esta avería.'

export const AVERIAS_FONTANERO_RESOLVER_SUCCESS =
  'La avería fue marcada como resuelta.'

export const AVERIAS_FONTANERO_CALIFICAR_TITULO = 'Calificar avería'

export const AVERIAS_FONTANERO_CALIFICAR_HINT =
  'Califique prioridad (Baja, Media o Alta) y tipo (Tubo madre o Tubo medidor).'

export const AVERIAS_FONTANERO_CALIFICAR_GUARDAR = 'Guardar calificación'

export const AVERIAS_FONTANERO_CALIFICAR_LOADING = 'Guardando calificación...'

export const AVERIAS_FONTANERO_CALIFICAR_SUCCESS =
  'La calificación se guardó correctamente.'

export const AVERIAS_FONTANERO_CALIFICAR_ERROR =
  'No fue posible guardar la calificación. Intente nuevamente.'

export const AVERIAS_FONTANERO_CALIFICAR_FORBIDDEN =
  'No tiene autorización para calificar esta avería.'

export const AVERIAS_FONTANERO_CALIFICAR_INVALIDA =
  'Seleccione una prioridad y un tipo válidos.'

export const OBSERVACION_AVERIA_MAX_LENGTH = 2000

export const OBSERVACION_FINAL_MAX_LENGTH = OBSERVACION_AVERIA_MAX_LENGTH

