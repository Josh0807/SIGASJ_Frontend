import type { ActividadRegistroFormField } from '../types/actividadRegistroForm'
import type { ActividadRegistroFormErrors } from './validateActividadRegistroForm'

const FIELD_FOCUS_ORDER: ActividadRegistroFormField[] = [
  'fechaActividad',
  'titulo',
  'descripcion',
  'ubicacion',
  'observaciones',
  'ubicacionFuga',
  'presionMedida',
  'resultadoVisita',
  'cantidadCloro',
  'caudal',
  'documentos',
]

export const focusFirstActividadRegistroError = (
  errors: ActividadRegistroFormErrors,
  root: ParentNode = document,
): ActividadRegistroFormField | null => {
  for (const field of FIELD_FOCUS_ORDER) {
    if (!errors[field]) {
      continue
    }

    const element = root.querySelector(`#${field}`) as HTMLElement | null
    if (!element) {
      continue
    }

    element.focus()
    if (typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return field
  }

  return null
}
