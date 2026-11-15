import { TIPO_NOTIFICACION_AVERIA } from './types'

export type NotificacionTone = 'info' | 'warning' | 'danger' | 'success' | 'neutral'

export type NotificacionVisualKind =
  | 'averia'
  | 'reposicion'
  | 'salida'
  | 'materiales'
  | 'ausencia'
  | 'actividad'
  | 'general'

/** Quita sellos QA/demo largos para lectura en campana. */
export function cleanNotificacionTexto(value: string | null | undefined): string {
  if (!value) return ''
  return (
    value
      .replace(/\s+QA\s+\d{8,}/gi, '')
      .replace(/\s+Demo\s+\d{10,}/gi, '')
      .replace(/\s+\d{10,}(?=\s|$|[.,;:!?)])/g, '')
      .replace(/\s+QA(?=\s|$|[.,;:!?])/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim() || value
  )
}

/**
 * Evita cuerpo que solo repite el código ya en el título
 * (p. ej. título "Nueva avería AV-…" y mensaje "Se registró la avería AV-…").
 */
export function resolveNotificacionMensaje(
  titulo: string,
  mensaje: string,
): string | null {
  const title = cleanNotificacionTexto(titulo)
  const body = cleanNotificacionTexto(mensaje)
  if (!body) return null

  const codeMatch = /\b(AV-\d{4}-\d+)\b/i.exec(title)
  if (codeMatch) {
    const code = codeMatch[1]
    const stripped = body
      .replace(new RegExp(`\\b${code}\\b`, 'ig'), '')
      .replace(/\s{2,}/g, ' ')
      .replace(/[.。]\s*$/, '')
      .trim()
    if (
      !stripped ||
      /^se registr[oó] la aver[ií]a\.?$/i.test(stripped) ||
      stripped.length < 8
    ) {
      return null
    }
  }

  if (body.toLowerCase() === title.toLowerCase()) return null
  return body
}

export function formatNotificacionRelativeTime(
  iso: string | null | undefined,
): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))
  if (minutes < 1) return 'Hace un momento'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'Hace 1 día' : `Hace ${days} días`
}

export function resolveNotificacionVisual(tipo: string): {
  kind: NotificacionVisualKind
  tone: NotificacionTone
} {
  switch (tipo) {
    case TIPO_NOTIFICACION_AVERIA.ALERTA_REPOSICION_ADMINISTRADORA:
      return { kind: 'reposicion', tone: 'warning' }
    case TIPO_NOTIFICACION_AVERIA.SALIDA_INVENTARIO_REGISTRADA_ADMINISTRADORA:
      return { kind: 'salida', tone: 'info' }
    case TIPO_NOTIFICACION_AVERIA.SOLICITUD_MATERIALES_PENDIENTE_ADMINISTRADORA:
    case TIPO_NOTIFICACION_AVERIA.SOLICITUD_MATERIALES_APROBADA_FONTANERO:
    case TIPO_NOTIFICACION_AVERIA.SOLICITUD_MATERIALES_RECHAZADA_FONTANERO:
      return {
        kind: 'materiales',
        tone:
          tipo ===
          TIPO_NOTIFICACION_AVERIA.SOLICITUD_MATERIALES_RECHAZADA_FONTANERO
            ? 'danger'
            : tipo ===
                TIPO_NOTIFICACION_AVERIA.SOLICITUD_MATERIALES_APROBADA_FONTANERO
              ? 'success'
              : 'info',
      }
    case TIPO_NOTIFICACION_AVERIA.SOLICITUD_AUSENCIA_PENDIENTE_ADMINISTRADORA:
    case TIPO_NOTIFICACION_AVERIA.SOLICITUD_AUSENCIA_APROBADA_FONTANERO:
    case TIPO_NOTIFICACION_AVERIA.SOLICITUD_AUSENCIA_RECHAZADA_FONTANERO:
      return {
        kind: 'ausencia',
        tone:
          tipo === TIPO_NOTIFICACION_AVERIA.SOLICITUD_AUSENCIA_RECHAZADA_FONTANERO
            ? 'danger'
            : tipo ===
                TIPO_NOTIFICACION_AVERIA.SOLICITUD_AUSENCIA_APROBADA_FONTANERO
              ? 'success'
              : 'info',
      }
    case TIPO_NOTIFICACION_AVERIA.ACTIVIDAD_REQUIERE_CORRECCION_FONTANERO:
      return { kind: 'actividad', tone: 'warning' }
    case TIPO_NOTIFICACION_AVERIA.AVERIA_REGISTRADA_ADMINISTRADORA:
    case TIPO_NOTIFICACION_AVERIA.AVERIA_ASIGNADA_FONTANERO:
    case TIPO_NOTIFICACION_AVERIA.AVERIA_CLASIFICADA_ADMINISTRADORA:
      return { kind: 'averia', tone: 'danger' }
    default:
      if (/ALERTA|REPOSICION/i.test(tipo)) {
        return { kind: 'reposicion', tone: 'warning' }
      }
      if (/SALIDA|INVENTARIO/i.test(tipo)) {
        return { kind: 'salida', tone: 'info' }
      }
      if (/AVERIA/i.test(tipo)) {
        return { kind: 'averia', tone: 'danger' }
      }
      return { kind: 'general', tone: 'neutral' }
  }
}
