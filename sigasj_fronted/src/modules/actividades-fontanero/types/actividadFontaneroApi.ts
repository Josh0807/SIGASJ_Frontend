import type { ActividadRegistroFormValues } from '../types/actividadRegistroForm'
import type { TipoActividadFontaneroCatalogo } from '../types/tipoActividadFontanero'

export type RegistrarActividadRequest = {
  tipoActividadId: number
  fechaActividad: string
  titulo: string
  ubicacion?: string
  observaciones?: string
}

export type ActividadFontaneroRegistrada = {
  id: number
  tipoActividadId: number
  tipoActividadNombre: string
  fechaActividad: string
  titulo: string
  descripcion: string | null
  ubicacion: string | null
  observaciones: string | null
  estado: string
  observacionCorreccion: string | null
  createdAt: string
  updatedAt: string
}

export const toRegistrarActividadPayload = (
  tipoActividadId: number,
  values: ActividadRegistroFormValues,
): RegistrarActividadRequest => {
  const payload: RegistrarActividadRequest = {
    tipoActividadId,
    fechaActividad: values.fechaActividad.trim(),
    titulo: values.titulo.trim(),
  }

  const ubicacion = values.ubicacion.trim()
  const observaciones = values.observaciones.trim()

  if (ubicacion) {
    payload.ubicacion = ubicacion
  }
  if (observaciones) {
    payload.observaciones = observaciones
  }

  return payload
}

export const toRegistrarActividadPayloadFromTipo = (
  tipo: TipoActividadFontaneroCatalogo,
  values: ActividadRegistroFormValues,
): RegistrarActividadRequest => toRegistrarActividadPayload(tipo.id, values)
