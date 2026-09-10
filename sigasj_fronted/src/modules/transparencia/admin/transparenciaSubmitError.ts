const DEFAULT_MESSAGE = 'No fue posible guardar la publicación. Intente nuevamente.'

export function toTransparenciaSubmitMessage(error: unknown): string {
  if (!(error instanceof Error)) return DEFAULT_MESSAGE

  const match = /^HTTP\s+(\d{3}):\s*(.*)$/s.exec(error.message.trim())
  if (!match) return DEFAULT_MESSAGE

  const status = Number(match[1])
  const detail = match[2].trim()

  if (status === 400 || status === 409 || status === 422) {
    return detail || 'Los datos enviados no son válidos. Revise el formulario.'
  }
  if (status === 413) {
    return 'El archivo supera el tamaño máximo permitido por el servidor.'
  }
  if (status === 401) {
    return 'La sesión expiró. Inicie sesión nuevamente e intente guardar.'
  }
  if (status === 403) {
    return 'No tiene permisos para guardar publicaciones de transparencia.'
  }

  return DEFAULT_MESSAGE
}
