import { getHttpStatus } from '../recursos-humanos/colaboradorForm'

const detalleBackend = (error: unknown): string => {
  const message = error instanceof Error ? error.message : ''
  const detail = message.replace(/^HTTP\s+\d{3}:\s*/i, '').trim()
  if (!detail) return ''
  try {
    const parsed: unknown = JSON.parse(detail)
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
        .join(' ')
    }
    if (typeof parsed === 'object' && parsed && 'message' in parsed) {
      const msg = (parsed as { message: unknown }).message
      if (typeof msg === 'string') return msg
      if (Array.isArray(msg)) {
        return msg.filter((m): m is string => typeof m === 'string').join(' ')
      }
    }
  } catch {
    // texto plano del backend
  }
  return detail
}

export const mensajeErrorAprobarSolicitud = (error: unknown): string => {
  const status = getHttpStatus(error)
  const detail = detalleBackend(error)
  if (status === 409) {
    if (/periodo|pendiente|disfrute|permiso registrado/i.test(detail)) {
      return (
        detail ||
        'Ya hay una ausencia en ese periodo. Revise permisos, vacaciones o solicitudes pendientes.'
      )
    }
    return 'Esta solicitud ya fue procesada.'
  }
  if (status === 404) return 'No se encontró la solicitud.'
  if (status === 403) return 'No tiene permiso para aprobar solicitudes.'
  if (
    status === 400 &&
    (/saldo/i.test(detail) || /dispon/i.test(detail) || /disfrut/i.test(detail))
  ) {
    return 'No es posible aprobar la solicitud porque el colaborador no cuenta con saldo suficiente de vacaciones.'
  }
  if (status === 400) {
    return detail || 'No fue posible aprobar la solicitud. Revise los datos.'
  }
  return 'No fue posible aprobar la solicitud. Intente nuevamente.'
}

export const mensajeErrorRechazarSolicitud = (error: unknown): string => {
  const status = getHttpStatus(error)
  if (status === 409) return 'Esta solicitud ya fue procesada.'
  if (status === 404) return 'No se encontró la solicitud.'
  if (status === 403) return 'No tiene permiso para rechazar solicitudes.'
  return 'No fue posible rechazar la solicitud. Intente nuevamente.'
}
