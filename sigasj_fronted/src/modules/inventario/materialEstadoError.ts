export type MaterialEstadoError = { status: number | null; message: string }

export function parseMaterialEstadoError(error: unknown): MaterialEstadoError {
  const raw = error instanceof Error ? error.message : ''
  const status = Number(/^HTTP (\d+):/.exec(raw)?.[1]) || null
  if (status === 400) return { status, message: 'No fue posible procesar el cambio de estado solicitado.' }
  if (status === 401) return { status, message: 'Su sesión expiró. Inicie sesión nuevamente.' }
  if (status === 403) return { status, message: 'Solo la Administradora puede cambiar el estado del material.' }
  if (status === 404) return { status, message: 'El material no fue encontrado. El listado se actualizará.' }
  return { status, message: 'No fue posible cambiar el estado del material. Intente nuevamente.' }
}
