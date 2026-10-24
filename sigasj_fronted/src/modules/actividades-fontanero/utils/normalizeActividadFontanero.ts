import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import type { DocumentoActividadRegistrado } from '../types/actividadFontaneroApi'

export const normalizeActividadFontanero = (
  item: unknown,
): ActividadFontaneroRegistrada | null => {
  if (!item || typeof item !== 'object') {
    return null
  }

  const record = item as Record<string, unknown>
  if (typeof record.id !== 'number' || typeof record.titulo !== 'string') {
    return null
  }

  const fontanero =
    record.fontanero && typeof record.fontanero === 'object'
      ? (record.fontanero as Record<string, unknown>)
      : null
  const nombreCompleto = fontanero
    ? [fontanero.nombre, fontanero.apellidos ?? fontanero.apellido]
        .filter((value): value is string =>
          typeof value === 'string' && Boolean(value.trim()),
        )
        .join(' ')
    : ''
  const readText = (value: unknown): string | null =>
    typeof value === 'string' && value.trim() ? value.trim() : null

  const datosEspecificos =
    record.datosEspecificos && typeof record.datosEspecificos === 'object'
      ? (record.datosEspecificos as Record<string, unknown>)
      : null

  const documentos = Array.isArray(record.documentos)
    ? record.documentos.filter((documento): documento is DocumentoActividadRegistrado => {
        if (!documento || typeof documento !== 'object') return false
        const item = documento as Record<string, unknown>
        return typeof item.id === 'number' && typeof item.nombreOriginal === 'string'
      })
    : []

  return {
    id: record.id,
    tipoActividadId:
      typeof record.tipoActividadId === 'number' ? record.tipoActividadId : 0,
    tipoActividadNombre:
      typeof record.tipoActividadNombre === 'string'
        ? record.tipoActividadNombre
        : '',
    tipoActividadCodigo:
      typeof record.tipoActividadCodigo === 'string'
        ? record.tipoActividadCodigo
        : undefined,
    fechaActividad:
      typeof record.fechaActividad === 'string' ? record.fechaActividad : '',
    horaInicio:
      readText(record.horaInicio) ?? readText(datosEspecificos?.horaInicio),
    fechaFin: readText(record.fechaFin) ?? readText(datosEspecificos?.fechaFin),
    horaFin: readText(record.horaFin) ?? readText(datosEspecificos?.horaFin),
    titulo: record.titulo,
    descripcion:
      typeof record.descripcion === 'string' ? record.descripcion : null,
    ubicacion: typeof record.ubicacion === 'string' ? record.ubicacion : null,
    observaciones:
      typeof record.observaciones === 'string' ? record.observaciones : null,
    estado: typeof record.estado === 'string' ? record.estado : '',
    estadoRevision:
      typeof record.estadoRevision === 'string'
        ? record.estadoRevision
        : record.estado === 'REVISADA'
          ? 'REVISADA'
          : 'PENDIENTE',
    fontaneroId:
      typeof record.fontaneroId === 'string' ? record.fontaneroId : undefined,
    fontaneroNombre:
      typeof record.fontaneroNombre === 'string'
        ? record.fontaneroNombre
        : nombreCompleto || undefined,
    fechaRevision:
      typeof record.fechaRevision === 'string' ? record.fechaRevision : null,
    revisadoPorId:
      typeof record.revisadoPorId === 'string' ? record.revisadoPorId : null,
    observacionCorreccion:
      typeof record.observacionCorreccion === 'string'
        ? record.observacionCorreccion
        : null,
    fechaRegistro:
      typeof record.fechaRegistro === 'string' ? record.fechaRegistro : undefined,
    datosEspecificos,
    documentos,
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : '',
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : '',
  }
}

export const mergeActividadFontanero = (
  current: ActividadFontaneroRegistrada | null,
  updated: ActividadFontaneroRegistrada,
): ActividadFontaneroRegistrada => {
  if (!current || current.id !== updated.id) {
    return updated
  }

  const incoming = updated.documentos ?? []
  const previous = current.documentos ?? []

  return {
    ...current,
    ...updated,
    documentos: incoming.length > 0 ? incoming : previous,
  }
}
