export type ActividadRegistroFormValues = {
  fechaActividad: string
  titulo: string
  ubicacion: string
  observaciones: string
}

export type ActividadRegistroFormField = keyof ActividadRegistroFormValues

export const ACTIVIDAD_REGISTRO_FORM_INITIAL: ActividadRegistroFormValues = {
  fechaActividad: '',
  titulo: '',
  ubicacion: '',
  observaciones: '',
}
