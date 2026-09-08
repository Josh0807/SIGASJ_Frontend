import type {
  ActividadRegistroFormField,
  ActividadRegistroFormValues,
} from '../types/actividadRegistroForm'
import type { TipoActividadFontaneroCodigo } from '../types/tipoActividadFontanero'
import { validateDocumentoActividad } from './validateDocumentoActividad'

export type ActividadRegistroFormErrors = Partial<
  Record<ActividadRegistroFormField, string>
>

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const validateActividadRegistroForm = (
  values: ActividadRegistroFormValues,
  tipoCodigo?: TipoActividadFontaneroCodigo,
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

  const requireText = (field: 'ubicacionFuga' | 'resultadoVisita', message: string) => {
    if (!values[field].trim()) errors[field] = message
  }
  const requirePositive = (
    field: 'presionMedida' | 'cantidadCloro' | 'caudal',
    message: string,
  ) => {
    const rawValue = values[field].trim()
    if (!rawValue || !Number.isFinite(Number(rawValue)) || Number(rawValue) <= 0) {
      errors[field] = message
    }
  }

  switch (tipoCodigo) {
    case 'CONTROL_FUGAS':
      requireText('ubicacionFuga', 'La ubicación de la fuga es obligatoria.')
      break
    case 'TOMA_PRESION':
      requirePositive('presionMedida', 'La presión medida debe ser un valor positivo.')
      break
    case 'VISITA_CAMPO':
      requireText('resultadoVisita', 'El resultado de la visita es obligatorio.')
      break
    case 'CONTROL_CLOROS':
      requirePositive('cantidadCloro', 'La cantidad de cloro debe ser un valor positivo.')
      break
    case 'CONTROL_OPERATIVO':
      requirePositive('caudal', 'El caudal debe ser un valor positivo.')
      break
    case 'INCAPACIDAD_VACACIONES':
      if (values.documentos.length === 0) {
        errors.documentos = 'Debe adjuntar al menos un documento.'
      } else if (values.documentos.length > 5) {
        errors.documentos = 'Puede adjuntar un máximo de 5 documentos.'
      } else {
        const invalidDocument = values.documentos.map(validateDocumentoActividad).find(Boolean)
        if (invalidDocument) errors.documentos = invalidDocument
      }
      break
  }

  return errors
}

export const hasActividadRegistroFormErrors = (
  errors: ActividadRegistroFormErrors,
): boolean => Object.keys(errors).length > 0
