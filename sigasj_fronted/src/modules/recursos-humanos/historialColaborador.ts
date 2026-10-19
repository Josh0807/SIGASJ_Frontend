import { getHttpStatus, nombreCompleto } from './colaboradorForm'
import { formatearFechaPermiso } from './permisoForm'
import type {
  EventoHistorialColaborador,
  HistorialColaboradorResumen,
  TipoEventoHistorialRrhh,
} from './types'

export const TIPO_EVENTO_LABEL: Record<TipoEventoHistorialRrhh, string> = {
  PERMISO: 'Permiso',
  VACACION: 'Vacaciones',
  INCAPACIDAD: 'Incapacidad',
}

export const etiquetaTipoEvento = (tipo: TipoEventoHistorialRrhh) =>
  TIPO_EVENTO_LABEL[tipo] ?? tipo

export const nombreColaboradorHistorial = (
  colaborador: HistorialColaboradorResumen,
) => nombreCompleto(colaborador)

export const formatearFechaEvento = formatearFechaPermiso

/** Detalle legible: reutiliza `descripcion` del Backend y refuerza rangos si aplica. */
export const detalleEventoHistorial = (
  evento: EventoHistorialColaborador,
): string => {
  const base = evento.descripcion?.trim()
  if (base) return base

  if (
    evento.tipo === 'INCAPACIDAD' &&
    evento.fechaInicio &&
    evento.fechaFin
  ) {
    return `${formatearFechaEvento(evento.fechaInicio)} — ${formatearFechaEvento(evento.fechaFin)}`
  }
  if (evento.tipo === 'PERMISO' && evento.motivo?.trim()) {
    return evento.motivo.trim()
  }
  if (
    evento.tipo === 'VACACION' &&
    evento.cantidadDias != null &&
    evento.tipoMovimiento
  ) {
    const n = evento.cantidadDias
    const dias = `${n} día${n === 1 ? '' : 's'}`
    return evento.tipoMovimiento === 'ACUMULADO'
      ? `+${dias} adquirido${n === 1 ? '' : 's'}`
      : `${dias} disfrutado${n === 1 ? '' : 's'}`
  }
  return 'Sin detalle'
}

export function historialErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const status = getHttpStatus(error)
  if (status === 403) {
    return 'No tiene acceso para consultar el historial administrativo.'
  }
  if (status === 404) {
    return 'No se encontró el colaborador solicitado.'
  }
  if (status === 400) {
    const message = error instanceof Error ? error.message : ''
    const detail = message.replace(/^HTTP\s+\d{3}:\s*/i, '').trim()
    if (!detail) return 'Revise los filtros seleccionados.'
    try {
      const parsed: unknown = JSON.parse(detail)
      if (Array.isArray(parsed)) {
        const textos = parsed.filter(
          (item): item is string => typeof item === 'string' && Boolean(item.trim()),
        )
        if (textos.length) return textos.join(' ')
      }
    } catch {
      // El backend también puede responder un mensaje plano.
    }
    return detail
  }
  if (status === null) {
    return 'No fue posible conectar con el servidor. Revise su conexión.'
  }
  if (status >= 500) {
    return 'No fue posible cargar el historial. Intente nuevamente.'
  }
  return fallback
}
