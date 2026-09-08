import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'

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

  return {
    id: record.id,
    tipoActividadId:
      typeof record.tipoActividadId === 'number' ? record.tipoActividadId : 0,
    tipoActividadNombre:
      typeof record.tipoActividadNombre === 'string'
        ? record.tipoActividadNombre
        : '',
    fechaActividad:
      typeof record.fechaActividad === 'string' ? record.fechaActividad : '',
    titulo: record.titulo,
    descripcion:
      typeof record.descripcion === 'string' ? record.descripcion : null,
    ubicacion: typeof record.ubicacion === 'string' ? record.ubicacion : null,
    observaciones:
      typeof record.observaciones === 'string' ? record.observaciones : null,
    estado: typeof record.estado === 'string' ? record.estado : '',
    observacionCorreccion:
      typeof record.observacionCorreccion === 'string'
        ? record.observacionCorreccion
        : null,
    datosEspecificos:
      record.datosEspecificos && typeof record.datosEspecificos === 'object'
        ? (record.datosEspecificos as Record<string, unknown>)
        : null,
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : '',
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : '',
  }
}
