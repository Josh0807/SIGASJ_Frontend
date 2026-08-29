import {
  isEstadoProyecto,
  type ProyectoFormField,
  type ProyectoFormValues,
} from './types'

export const PROYECTO_NOMBRE_MAX_LENGTH = 200
export const PROYECTO_ENCARGADO_MAX_LENGTH = 150
export const PROYECTO_DURACION_MAX_LENGTH = 100

export const PROYECTO_IMAGEN_MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
export const PROYECTO_IMAGEN_ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]
export const PROYECTO_IMAGEN_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

export function validateProyectoImagenFile(file: File): string | null {
  const name = file.name.toLowerCase()
  const extensionIndex = name.lastIndexOf('.')
  const extension = extensionIndex >= 0 ? name.substring(extensionIndex) : ''

  const isTypeAllowed =
    PROYECTO_IMAGEN_ALLOWED_TYPES.includes(file.type.toLowerCase()) ||
    (extension && PROYECTO_IMAGEN_ALLOWED_EXTENSIONS.includes(extension))

  if (!isTypeAllowed) {
    return 'Formato de imagen no permitido. Solo se aceptan imágenes JPG, PNG, WEBP o GIF.'
  }

  if (file.size > PROYECTO_IMAGEN_MAX_SIZE_BYTES) {
    return 'El archivo supera el tamaño máximo permitido (5 MB).'
  }

  return null
}

export type ProyectoFormValidationError = {
  field: ProyectoFormField
  message: string
}

export function getProyectoFormValidationError(
  values: ProyectoFormValues,
): ProyectoFormValidationError | null {
  const nombre = values.nombre.trim()
  if (!nombre) {
    return {
      field: 'nombre',
      message: 'El nombre del proyecto es obligatorio.',
    }
  }
  if (nombre.length > PROYECTO_NOMBRE_MAX_LENGTH) {
    return {
      field: 'nombre',
      message: `El nombre del proyecto no puede superar ${PROYECTO_NOMBRE_MAX_LENGTH} caracteres.`,
    }
  }

  const encargado = values.encargadoRealizacion.trim()
  if (!encargado) {
    return {
      field: 'encargadoRealizacion',
      message: 'Debe indicar el encargado.',
    }
  }
  if (encargado.length > PROYECTO_ENCARGADO_MAX_LENGTH) {
    return {
      field: 'encargadoRealizacion',
      message: `El encargado no puede superar ${PROYECTO_ENCARGADO_MAX_LENGTH} caracteres.`,
    }
  }

  const duracion = values.duracion.trim()
  if (!duracion) {
    return {
      field: 'duracion',
      message: 'La duración es obligatoria.',
    }
  }
  if (duracion.length > PROYECTO_DURACION_MAX_LENGTH) {
    return {
      field: 'duracion',
      message: `La duración no puede superar ${PROYECTO_DURACION_MAX_LENGTH} caracteres.`,
    }
  }

  if (!isEstadoProyecto(values.estado)) {
    return {
      field: 'estado',
      message: 'Seleccione un estado válido.',
    }
  }

  return null
}

export function validateProyectoForm(values: ProyectoFormValues): string | null {
  return getProyectoFormValidationError(values)?.message ?? null
}
