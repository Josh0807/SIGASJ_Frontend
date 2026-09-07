import type {
  ActividadRegistroFormField,
  ActividadRegistroFormValues,
} from '../types/actividadRegistroForm'

export type ActividadRegistroFormErrors = Partial<
  Record<ActividadRegistroFormField, string>
>

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const validateActividadRegistroForm = (
  values: ActividadRegistroFormValues,
): ActividadRegistroFormErrors => {
  const errors: ActividadRegistroFormErrors = {}
  const fecha = values.fechaActividad.trim()
  const titulo = values.titulo.trim()

  if (!fecha) {
    errors.fechaActividad = 'La fecha de la actividad es obligatoria.'
  } else if (!DATE_PATTERN.test(fecha)) {
    errors.fechaActividad = 'Use el formato YYYY-MM-DD.'
  }

  if (!titulo) {
    errors.titulo = 'El título o resumen de la actividad es obligatorio.'
  } else if (titulo.length > 200) {
    errors.titulo = 'El título no puede superar 200 caracteres.'
  }

  if (values.ubicacion.trim().length > 200) {
    errors.ubicacion = 'La ubicación no puede superar 200 caracteres.'
  }

  return errors
}

export const hasActividadRegistroFormErrors = (
  errors: ActividadRegistroFormErrors,
): boolean => Object.keys(errors).length > 0
