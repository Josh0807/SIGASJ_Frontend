import {
  FORMULARIO_DESCARGABLE_DESCRIPCION_MAX,
  FORMULARIO_DESCARGABLE_MAX_BYTES,
  FORMULARIO_DESCARGABLE_NOMBRE_MAX,
} from './types'

const readHeader = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No fue posible leer el archivo.'))
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer)
      resolve(String.fromCharCode(...bytes))
    }
    reader.readAsArrayBuffer(file.slice(0, 5))
  })

/** Validación UX de PDF (Backend sigue siendo autoridad). */
export async function validateFormularioDescargablePdf(
  file: File,
): Promise<string | null> {
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return 'Selecciona un archivo con extensión .pdf.'
  }
  if (file.type !== 'application/pdf') {
    return 'El archivo debe tener el tipo application/pdf.'
  }
  if (file.size === 0) {
    return 'El archivo PDF está vacío.'
  }
  if (file.size > FORMULARIO_DESCARGABLE_MAX_BYTES) {
    return 'El archivo PDF no puede superar 10 MB.'
  }

  try {
    if ((await readHeader(file)) !== '%PDF-') {
      return 'El archivo seleccionado no contiene un PDF válido.'
    }
  } catch {
    return 'No fue posible comprobar el contenido del archivo.'
  }
  return null
}

export function validateNombreFormularioDescargable(
  nombre: string,
): string | null {
  const trimmed = nombre.trim()
  if (!trimmed) return 'El nombre del formulario es obligatorio.'
  if (trimmed.length > FORMULARIO_DESCARGABLE_NOMBRE_MAX) {
    return `El nombre no puede exceder ${FORMULARIO_DESCARGABLE_NOMBRE_MAX} caracteres.`
  }
  return null
}

/**
 * Validación de descripción.
 * En creación (required=true) es obligatoria según PBI 4.15.4, aunque el DTO BE la permita opcional.
 */
export function validateDescripcionFormularioDescargable(
  descripcion: string,
  options: { required?: boolean } = {},
): string | null {
  const trimmed = descripcion.trim()
  if (options.required && !trimmed) {
    return 'La descripción es obligatoria.'
  }
  if (trimmed.length > FORMULARIO_DESCARGABLE_DESCRIPCION_MAX) {
    return `La descripción no puede exceder ${FORMULARIO_DESCARGABLE_DESCRIPCION_MAX} caracteres.`
  }
  return null
}
