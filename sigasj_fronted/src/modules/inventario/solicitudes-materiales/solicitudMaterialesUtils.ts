import type {
  CreateSolicitudMaterialesPayload,
  SolicitudMaterialFormErrors,
  SolicitudMaterialFormRow,
  SolicitudMaterialesListItem,
  SolicitudesMaterialesListResponse,
} from './types'

export const createEmptyMaterialRow = (): SolicitudMaterialFormRow => ({
  key: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  materialId: '',
  cantidad: '',
  observacion: '',
})

export const validateSolicitudMateriales = (
  rows: SolicitudMaterialFormRow[],
  motivo: string,
): SolicitudMaterialFormErrors => {
  const errors: SolicitudMaterialFormErrors = { rows: {} }
  const selected = new Set<string>()

  if (rows.length === 0) errors.form = 'Agregue al menos un material.'
  if (motivo.trim().length > 1000) {
    errors.motivo = 'La observación general no puede superar 1000 caracteres.'
  }

  rows.forEach((row) => {
    const rowErrors: SolicitudMaterialFormErrors['rows'][string] = {}
    if (!row.materialId) {
      rowErrors.materialId = 'Seleccione un material.'
    } else if (selected.has(row.materialId)) {
      rowErrors.materialId = 'Este material ya fue agregado.'
    } else {
      selected.add(row.materialId)
    }

    const quantity = Number(row.cantidad)
    if (!row.cantidad || !Number.isInteger(quantity) || quantity <= 0) {
      rowErrors.cantidad = 'Ingrese una cantidad entera mayor a cero.'
    }
    if (row.observacion.trim().length > 255) {
      rowErrors.observacion = 'La nota no puede superar 255 caracteres.'
    }
    if (Object.keys(rowErrors).length) errors.rows[row.key] = rowErrors
  })

  return errors
}

export const hasSolicitudMaterialesErrors = (errors: SolicitudMaterialFormErrors) =>
  Boolean(errors.form || errors.motivo || Object.keys(errors.rows).length)

export const toSolicitudMaterialesPayload = (
  rows: SolicitudMaterialFormRow[],
  motivo: string,
  idAveria?: number,
): CreateSolicitudMaterialesPayload => ({
  ...(idAveria ? { idAveria } : {}),
  ...(motivo.trim() ? { motivo: motivo.trim() } : {}),
  materiales: rows.map((row) => ({
    idMaterial: Number(row.materialId),
    cantidad: Number(row.cantidad),
    ...(row.observacion.trim() ? { observacion: row.observacion.trim() } : {}),
  })),
})

export const solicitudMaterialesErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('HTTP 403')) {
    return message.toLowerCase().includes('avería') || message.toLowerCase().includes('averia')
      ? 'La avería seleccionada no está asignada a su usuario.'
      : 'Su sesión no tiene permiso para registrar solicitudes de materiales.'
  }
  if (message.includes('HTTP 404')) return 'Uno de los materiales ya no existe. Actualice el catálogo e inténtelo de nuevo.'
  if (message.includes('HTTP 400')) return 'Revise los datos. Es posible que un material ya no se encuentre activo.'
  return 'No fue posible registrar la solicitud. Compruebe su conexión e inténtelo de nuevo.'
}

export const normalizeSolicitudesMaterialesList = (
  response: SolicitudesMaterialesListResponse,
): SolicitudMaterialesListItem[] => Array.isArray(response) ? response : response.data ?? []

export const getSolicitudMaterialesCount = (request: SolicitudMaterialesListItem) =>
  request.cantidadMateriales ?? request.totalMateriales ?? request.detalles?.length ?? 0

export const getSolicitudAveriaReference = (request: SolicitudMaterialesListItem) =>
  request.averia?.codigo ?? request.averia?.numero ?? request.averia?.referencia ??
  (request.idAveria ? `Avería #${request.idAveria}` : '—')

export const formatSolicitudDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Fecha no disponible'
    : new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export const formatSolicitudStatus = (status: string) => {
  const normalized = status.trim().replaceAll('_', ' ').toLocaleLowerCase('es')
  return normalized ? normalized.charAt(0).toLocaleUpperCase('es') + normalized.slice(1) : 'Sin estado'
}

export const getHttpErrorStatus = (error: unknown) => {
  const match = (error instanceof Error ? error.message : '').match(/HTTP\s+(\d{3})/i)
  return match ? Number(match[1]) : null
}
