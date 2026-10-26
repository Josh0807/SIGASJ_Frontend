import { hoyEnAsada } from '../../../shared/utils/fechaAsada'
import type {
  ActividadRegistroFormField,
  ActividadRegistroFormValues,
} from '../types/actividadRegistroForm'
import type { TipoActividadFontaneroCodigo } from '../types/tipoActividadFontanero'
import {
  FOTO_EVIDENCIA_MAX_FILES,
  validateDocumentoActividad,
  validateFotoEvidencia,
} from './validateDocumentoActividad'

export type ActividadRegistroFormMode = 'registrar' | 'corregir' | 'borrador'

export type ActividadRegistroFormErrors = Partial<
  Record<ActividadRegistroFormField, string>
>

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

const CORREGIR_SKIP_FIELDS = new Set<ActividadRegistroFormField>([
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
  const horaInicio = (values.horaInicio ?? '').trim().slice(0, 5)
  const fechaFin = (values.fechaFin ?? '').trim()
  const horaFin = (values.horaFin ?? '').trim().slice(0, 5)
  const titulo = values.titulo.trim()
  const hoy = hoyEnAsada()

  if (!skipField('fechaActividad')) {
    if (!fecha) {
      errors.fechaActividad = 'Este campo es obligatorio.'
    } else if (!DATE_PATTERN.test(fecha)) {
      errors.fechaActividad = 'Use el formato YYYY-MM-DD.'
    } else if (fecha > hoy) {
      errors.fechaActividad = 'La fecha de inicio no puede ser futura.'
    }
  }

  if (!skipField('horaInicio')) {
    if (!horaInicio) {
      errors.horaInicio = 'Este campo es obligatorio.'
    } else if (!TIME_PATTERN.test(horaInicio)) {
      errors.horaInicio = 'Use el formato HH:mm.'
    }
  }

  const requireFin = !(skipField('fechaFin') || mode === 'borrador')

  if (requireFin && !fechaFin) {
    errors.fechaFin = 'Este campo es obligatorio.'
  } else if (fechaFin) {
    if (!DATE_PATTERN.test(fechaFin)) {
      errors.fechaFin = 'Use el formato YYYY-MM-DD.'
    } else if (fecha && DATE_PATTERN.test(fecha) && fechaFin < fecha) {
      errors.fechaFin = 'No puede ser anterior a la fecha de inicio.'
    } else if (fechaFin > hoy) {
      errors.fechaFin =
        'La fecha de finalización no puede ser futura. Si la actividad aún no termina, guarde un borrador y déjela vacía.'
    }
  }

  if (requireFin && !horaFin) {
    errors.horaFin = 'Este campo es obligatorio.'
  } else if (horaFin) {
    if (!TIME_PATTERN.test(horaFin)) {
      errors.horaFin = 'Use el formato HH:mm.'
    } else if (
      fecha &&
      fechaFin &&
      fecha === fechaFin &&
      TIME_PATTERN.test(horaInicio) &&
      horaFin <= horaInicio
    ) {
      errors.horaFin = 'Debe ser posterior a la hora de inicio guardada.'
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
        } else if (values.documentos.length > FOTO_EVIDENCIA_MAX_FILES) {
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

  if (tipoCodigo !== 'INCAPACIDAD_VACACIONES' && values.documentos.length > 0) {
    if (values.documentos.length > FOTO_EVIDENCIA_MAX_FILES) {
      errors.documentos = 'Puede adjuntar un máximo de 5 fotos.'
    } else {
      const invalidPhoto = values.documentos.map(validateFotoEvidencia).find(Boolean)
      if (invalidPhoto) {
        errors.documentos = invalidPhoto
      }
    }
  }

  return errors
}

export const hasActividadRegistroFormErrors = (
  errors: ActividadRegistroFormErrors,
): boolean => Object.keys(errors).length > 0
