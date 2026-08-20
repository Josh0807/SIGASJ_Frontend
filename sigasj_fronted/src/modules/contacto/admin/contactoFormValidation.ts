import type { ContactoFormValues } from '../types/contacto.types'

export type ContactoFormErrors = Partial<Record<keyof ContactoFormValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_PATTERN = /^https?:\/\/.+/i

function countDigits(value: string): number {
  return value.replace(/\D/g, '').length
}

export function validateContactoFormValues(
  values: ContactoFormValues,
): ContactoFormErrors {
  const errors: ContactoFormErrors = {}

  if (!values.telefono.trim()) {
    errors.telefono = 'Ingresa el teléfono principal.'
  } else if (countDigits(values.telefono) < 8) {
    errors.telefono = 'El teléfono debe tener al menos 8 dígitos.'
  }

  if (!values.email.trim()) {
    errors.email = 'Ingresa un correo electrónico.'
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'El correo no tiene un formato válido.'
  }

  if (!values.horarioAtencion.trim()) {
    errors.horarioAtencion = 'Indica el horario de atención.'
  }

  if (!values.direccion.trim()) {
    errors.direccion = 'Ingresa la dirección física.'
  }

  if (!values.regionResumen.trim()) {
    errors.regionResumen = 'Indica el resumen regional para el footer.'
  }

  const mapUrl = values.mapaUrl.trim()
  if (mapUrl && !URL_PATTERN.test(mapUrl)) {
    errors.mapaUrl = 'Usa un enlace que comience con http:// o https://'
  }

  const facebookUrl = values.urlFacebook.trim()
  if (facebookUrl && !URL_PATTERN.test(facebookUrl)) {
    errors.urlFacebook = 'Usa un enlace que comience con http:// o https://'
  }

  const lat = values.mapaLatitud.trim()
  const lng = values.mapaLongitud.trim()

  if (lat || lng) {
    if (!lat || !lng) {
      errors.mapaLatitud = 'Completa latitud y longitud, o deja ambos vacíos.'
      errors.mapaLongitud = 'Completa latitud y longitud, o deja ambos vacíos.'
    } else {
      const latNum = Number(lat)
      const lngNum = Number(lng)

      if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
        errors.mapaLatitud = 'La latitud debe estar entre -90 y 90.'
      }

      if (!Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
        errors.mapaLongitud = 'La longitud debe estar entre -180 y 180.'
      }
    }
  }

  const zoom = Number.parseInt(values.mapaZoom, 10)
  if (values.mapaZoom.trim() && (!Number.isFinite(zoom) || zoom < 1 || zoom > 21)) {
    errors.mapaZoom = 'El zoom debe ser un número entre 1 y 21.'
  }

  return errors
}

export function hasContactoFormErrors(errors: ContactoFormErrors): boolean {
  return Object.keys(errors).length > 0
}
