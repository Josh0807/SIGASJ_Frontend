import type {
  ActividadRegistroFormField,
  ActividadRegistroFormValues,
} from '../types/actividadRegistroForm'
import type { TipoActividadFontaneroCodigo } from '../types/tipoActividadFontanero'
import { validateDocumentoActividad } from './validateDocumentoActividad'

export type ActividadRegistroFormMode = 'registrar' | 'corregir'

export type ActividadRegistroFormErrors = Partial<
  Record<ActividadRegistroFormField, string>
>

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const CORREGIR_SKIP_FIELDS = new Set<ActividadRegistroFormField>([
  'fechaActividad',
  'observaciones',
  'documentos',
])

export const validateActividadRegistroForm = (
  values: ActividadRegistroFormValues,
  tipoCodigo?: TipoActividadFontaneroCodigo,
  mode: ActividadRegistroFormMode = 'registrar',
): ActividadRegistroFormErrors => {
  const errors: ActividadRegistroFormErrors = {}
  const skipField = (field: ActividadRegistroFormField) =>
    mode === 'corregir' && CORREGIR_SKIP_FIELDS.has(field)

  const fecha = values.fechaActividad.trim()
  const titulo = values.titulo.trim()

  if (!skipField('fechaActividad')) {
    if (!fecha) {
      errors.fechaActividad = 'Este campo es obligatorio.'
    } else if (!DATE_PATTERN.test(fecha)) {
      errors.fechaActividad = 'Use el formato YYYY-MM-DD.'
    }
  }

  if (!titulo) {
    errors.titulo = 'Este campo es obligatorio.'
  } else if (titulo.length > 200) {
    errors.titulo = 'El título no puede superar 200 caracteres.'
  }

  if (values.ubicacion.trim().length > 200) {
    errors.ubicacion = 'La ubicación no puede superar 200 caracteres.'
  }

  const requireText = (field: 'ubicacionFuga' | 'resultadoVisita', message: string) => {
    if (!values[field].trim()) {
      errors[field] = message
    }
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
      requireText('ubicacionFuga', 'Este campo es obligatorio.')
      break
    case 'TOMA_PRESION':
      requirePositive('presionMedida', 'Ingrese un valor numérico mayor que cero.')
      break
    case 'VISITA_CAMPO':
      requireText('resultadoVisita', 'Este campo es obligatorio.')
      break
    case 'CONTROL_CLOROS':
      requirePositive('cantidadCloro', 'Ingrese un valor numérico mayor que cero.')
      break
    case 'CONTROL_OPERATIVO':
      requirePositive('caudal', 'Ingrese un valor numérico mayor que cero.')
      break
    case 'INCAPACIDAD_VACACIONES':
      if (!skipField('documentos')) {
        if (values.documentos.length === 0) {
          errors.documentos = 'Debe adjuntar al menos un documento.'
        } else if (values.documentos.length > 5) {
          errors.documentos = 'Puede adjuntar un máximo de 5 documentos.'
        } else {
          const invalidDocument = values.documentos.map(validateDocumentoActividad).find(Boolean)
          if (invalidDocument) {
            errors.documentos = invalidDocument
          }
        }
      }
      break
  }

  return errors
}

export const hasActividadRegistroFormErrors = (
  errors: ActividadRegistroFormErrors,
): boolean => Object.keys(errors).length > 0
