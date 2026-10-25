import { horaEnAsada, hoyEnAsada } from '../../../shared/utils/fechaAsada'

export type ActividadRegistroFormValues = {
  fechaActividad: string
  horaInicio: string
  fechaFin: string
  horaFin: string
  titulo: string
  descripcion: string
  ubicacion: string
  observaciones: string
  ubicacionFuga: string
  presionMedida: string
  resultadoVisita: string
  cantidadCloro: string
  caudal: string
  documentos: File[]
}

export type ActividadRegistroFormField = keyof ActividadRegistroFormValues

export const createActividadRegistroFormInitial = (
  ahora: Date = new Date(),
): ActividadRegistroFormValues => {
  const hoy = hoyEnAsada(ahora)
  return {
    fechaActividad: hoy,
    horaInicio: horaEnAsada(ahora),
    fechaFin: '',
    horaFin: '',
    titulo: '',
    descripcion: '',
    ubicacion: '',
    observaciones: '',
    ubicacionFuga: '',
    presionMedida: '',
    resultadoVisita: '',
    cantidadCloro: '',
    caudal: '',
    documentos: [],
  }
}

export const ACTIVIDAD_REGISTRO_FORM_INITIAL = createActividadRegistroFormInitial()
