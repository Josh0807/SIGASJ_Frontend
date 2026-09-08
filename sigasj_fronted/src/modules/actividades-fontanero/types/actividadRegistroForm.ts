export type ActividadRegistroFormValues = {
  fechaActividad: string
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

export const ACTIVIDAD_REGISTRO_FORM_INITIAL: ActividadRegistroFormValues = {
  fechaActividad: '',
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
