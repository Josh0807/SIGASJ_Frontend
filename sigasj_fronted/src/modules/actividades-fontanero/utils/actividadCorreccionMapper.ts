import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import type { ActividadRegistroFormValues } from '../types/actividadRegistroForm'
import type { TipoActividadFontaneroCodigo } from '../types/tipoActividadFontanero'

const readString = (value: unknown): string =>
  typeof value === 'string' ? value : value != null ? String(value) : ''

const readNumberString = (value: unknown): string => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  return readString(value)
}

export const actividadToFormValues = (
  actividad: ActividadFontaneroRegistrada,
): ActividadRegistroFormValues => {
  const datos = actividad.datosEspecificos ?? {}

  return {
    fechaActividad: actividad.fechaActividad?.slice(0, 10) ?? '',
    titulo: actividad.titulo ?? '',
    descripcion: actividad.descripcion ?? '',
    ubicacion: actividad.ubicacion ?? '',
    observaciones: actividad.observaciones ?? '',
    ubicacionFuga: readNumberString(datos.ubicacionFuga),
    presionMedida: readNumberString(datos.presionMedida),
    resultadoVisita: readString(datos.resultadoVisita),
    cantidadCloro: readNumberString(datos.cantidadCloro),
    caudal: readNumberString(datos.caudal),
    documentos: [],
  }
}

export type CorregirActividadRequest = {
  titulo: string
  descripcion?: string
  ubicacion?: string
  presionMedida?: number
  caudal?: number
  cantidadCloro?: number
  ubicacionFuga?: string
  resultadoVisita?: string
}

export const toCorregirActividadPayload = (
  values: ActividadRegistroFormValues,
  tipoCodigo: TipoActividadFontaneroCodigo,
): CorregirActividadRequest => {
  const payload: CorregirActividadRequest = {
    titulo: values.titulo.trim(),
  }

  const descripcion = values.descripcion.trim()
  const ubicacion = values.ubicacion.trim()

  if (descripcion) {
    payload.descripcion = descripcion
  }
  if (ubicacion) {
    payload.ubicacion = ubicacion
  }

  switch (tipoCodigo) {
    case 'CONTROL_FUGAS':
      if (values.ubicacionFuga.trim()) {
        payload.ubicacionFuga = values.ubicacionFuga.trim()
      }
      break
    case 'TOMA_PRESION':
      if (values.presionMedida.trim()) {
        payload.presionMedida = Number(values.presionMedida)
      }
      break
    case 'VISITA_CAMPO':
      if (values.resultadoVisita.trim()) {
        payload.resultadoVisita = values.resultadoVisita.trim()
      }
      break
    case 'CONTROL_CLOROS':
      if (values.cantidadCloro.trim()) {
        payload.cantidadCloro = Number(values.cantidadCloro)
      }
      break
    case 'CONTROL_OPERATIVO':
      if (values.caudal.trim()) {
        payload.caudal = Number(values.caudal)
      }
      break
    default:
      break
  }

  return payload
}
