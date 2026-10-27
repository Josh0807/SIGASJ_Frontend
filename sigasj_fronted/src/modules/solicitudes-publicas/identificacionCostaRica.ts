import { z } from 'zod'

/** Solo dígitos (ignora guiones, espacios, etc.). */
export const soloDigitos = (value: string): string => value.replace(/\D/g, '')

export const TELEFONO_CR_DIGITOS = 8
export const CEDULA_FISICA_DIGITOS = 9

/**
 * Recorta la entrada para no superar `maxDigits` números.
 * Conserva guiones/espacios; descarta el resto de caracteres.
 */
export const limitarDigitosEntrada = (
  value: string,
  maxDigits: number,
): string => {
  let count = 0
  let result = ''
  for (const char of value) {
    if (/\d/.test(char)) {
      if (count >= maxDigits) continue
      count += 1
      result += char
      continue
    }
    if (char === '-' || char === ' ') {
      result += char
    }
  }
  return result
}

export const limitarCedulaFisica = (value: string): string =>
  limitarDigitosEntrada(value, CEDULA_FISICA_DIGITOS)

export const limitarTelefonoCr = (value: string): string =>
  limitarDigitosEntrada(value, TELEFONO_CR_DIGITOS)

/** Teléfono nacional CR: exactamente 8 dígitos. */
export const telefonoCostaRicaSchema = (
  label = 'el teléfono de contacto',
): z.ZodType<string> =>
  z
    .string()
    .trim()
    .min(1, `Ingresa ${label}.`)
    .refine(
      (value) => soloDigitos(value).length === TELEFONO_CR_DIGITOS,
      `El teléfono debe tener exactamente ${TELEFONO_CR_DIGITOS} dígitos.`,
    )

/**
 * Cédula física CR: exactamente 9 dígitos.
 * (Acepta formato con guiones, p. ej. 1-2345-6789.)
 */
export const cedulaFisicaSchema = (
  label = 'la cédula o identificación',
): z.ZodType<string> =>
  z
    .string()
    .trim()
    .min(1, `Ingresa ${label}.`)
    .refine(
      (value) => soloDigitos(value).length === CEDULA_FISICA_DIGITOS,
      `La cédula debe tener exactamente ${CEDULA_FISICA_DIGITOS} dígitos.`,
    )

/** Máximo de caracteres visibles con guiones (1-2345-6789 → 11). */
export const CEDULA_FISICA_MAX_LENGTH = 11
/** 8888-8888 */
export const TELEFONO_CR_MAX_LENGTH = 9

/** Mensaje si el valor no tiene exactamente `expected` dígitos (vacío → null). */
export const mensajeDigitosExactos = (
  value: string,
  expected: number,
  campo: 'teléfono' | 'cédula',
): string | null => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const count = soloDigitos(trimmed).length
  if (count === expected) return null
  if (campo === 'teléfono') {
    return `El teléfono debe tener exactamente ${expected} dígitos.`
  }
  return `La cédula debe tener exactamente ${expected} dígitos.`
}
