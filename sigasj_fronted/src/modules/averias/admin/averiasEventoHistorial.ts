import { ESTADO_AVERIA_LABELS, isEstadoAveria } from './estadoAveria'
import { formatAveriaAdminDateTime } from './formatAveriaAdminDate'
import type { AveriaEventoHistorial } from './types'

export const TIPO_EVENTO_AVERIA_LABELS: Record<string, string> = {
  REGISTRO: 'Registro',
  CODIGO_SEGUIMIENTO: 'Código de seguimiento',
  ASIGNACION_FONTANERO: 'Asignación',
  CAMBIO_ESTADO: 'Cambio de estado',
  INICIO_ATENCION: 'Inicio de atención',
  CAMBIO_PRIORIDAD: 'Prioridad',
  CLASIFICACION_TIPO: 'Clasificación',
  OBSERVACION: 'Observación',
  SOLICITUD_MATERIAL: 'Solicitud de materiales',
  SALIDA_MATERIAL: 'Salida de material',
  RESOLUCION: 'Resolución',
  NOTIFICACION: 'Notificación',
}

const REFERENCIA_LABELS: Record<string, string> = {
  ObservacionAveria: 'Observación registrada',
  SolicitudMaterial: 'Solicitud de materiales',
  MovimientoInventario: 'Salida de material',
  NotificacionAveria: 'Notificación interna',
  IntentoSmsAveria: 'Notificación SMS',
}

export const etiquetaTipoEvento = (tipoEvento: string): string =>
  TIPO_EVENTO_AVERIA_LABELS[tipoEvento] ?? 'Evento'

export const etiquetaEstadoEvento = (estado: string): string =>
  isEstadoAveria(estado) ? ESTADO_AVERIA_LABELS[estado] : estado

export const formatFechaHoraEvento = (
  value: string | null | undefined,
): string => {
  const formatted = formatAveriaAdminDateTime(value)
  if (formatted === '—') {
    return formatted
  }
  return formatted.replace(' ', ' - ')
}

export const textoEstadoEvento = (
  evento: Pick<AveriaEventoHistorial, 'estadoAnterior' | 'estadoNuevo'>,
): string | null => {
  const anterior = evento.estadoAnterior?.trim()
  const nuevo = evento.estadoNuevo?.trim()
  if (anterior && nuevo) {
    return `Estado: ${etiquetaEstadoEvento(anterior)} → ${etiquetaEstadoEvento(nuevo)}`
  }
  if (nuevo) {
    return `Estado: ${etiquetaEstadoEvento(nuevo)}`
  }
  if (anterior) {
    return `Estado anterior: ${etiquetaEstadoEvento(anterior)}`
  }
  return null
}

export const textoResponsableEvento = (
  evento: Pick<AveriaEventoHistorial, 'usuario'>,
): string | null => {
  const nombre = evento.usuario?.nombre?.trim()
  if (!nombre) {
    return null
  }
  return `Realizado por: ${nombre}`
}

export const textoReferenciaEvento = (
  evento: Pick<AveriaEventoHistorial, 'referencia'>,
): string | null => {
  const tipo = evento.referencia?.tipo?.trim()
  if (!tipo) {
    return null
  }
  return REFERENCIA_LABELS[tipo] ?? null
}
