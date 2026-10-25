import { getHttpStatus } from '../../recursos-humanos/colaboradorForm'

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
    if (parsed && typeof parsed === 'object' && 'message' in parsed) {
      const msg = (parsed as { message?: unknown }).message
      return Array.isArray(msg) ? msg.map(String).join('. ') : String(msg ?? '')
    }
  } catch {
    // texto plano del backend
  }
  return detail
}

export const mensajeErrorCambioEstado = (error: unknown): string => {
  const status = getHttpStatus(error)
  if (status === 400) {
    return detalleBackend(error) || 'No se pudo cambiar el estado. Revise los datos ingresados.'
  }
  if (status === 403) {
    return 'No tiene permiso para cambiar el estado de solicitudes.'
  }
  if (status === 404) {
    return 'La solicitud ya no existe o fue eliminada.'
  }
  if (status === 409) {
    return (
      detalleBackend(error) ||
      'El estado de la solicitud cambió por otra operación. Se actualizará la información.'
    )
  }
  if (status === null) {
    return 'No fue posible conectar con el servidor. Revise su conexión.'
  }
  return detalleBackend(error) || 'No fue posible actualizar el estado. Intente nuevamente.'
}
