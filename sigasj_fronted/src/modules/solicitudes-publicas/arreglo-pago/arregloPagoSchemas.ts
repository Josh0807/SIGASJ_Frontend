import { z } from 'zod'
import { PLAZOS_ARREGLO_PAGO } from './types'

const requiredLimitedText = (label: string, max: number) =>
  z.string().trim().min(1, `Ingresa ${label}.`).max(max, `${label.charAt(0).toUpperCase()}${label.slice(1)} no puede superar ${max} caracteres.`)

export const arregloPagoApplicantSchema = z.object({
  nombre: requiredLimitedText('el nombre completo', 150),
  cedula: requiredLimitedText('la cédula o identificación', 30),
  vecinoDe: requiredLimitedText('la dirección o lugar de residencia', 200),
  telefono: requiredLimitedText('el teléfono de contacto', 30),
})

export const arregloPagoServiceSchema = z.object({
  numeroCuentaServicio: requiredLimitedText('el número de cuenta, contrato o NIS', 50),
  montoPrimaInicial: z
    .string()
    .trim()
    .min(1, 'Ingresa el monto de la prima inicial.')
    .regex(/^\d+(?:[.,]\d+)?$/, 'La prima inicial debe ser un número igual o mayor que cero.')
    .refine((value) => Number(value.replace(',', '.')) >= 0, 'La prima inicial no puede ser negativa.'),
  plazoSeleccionado: z.enum(PLAZOS_ARREGLO_PAGO, {
    error: 'Selecciona uno de los plazos oficiales.',
  }),
})

export const arregloPagoDocumentsSchema = z.object({
  documentos: z.array(z.instanceof(File)).min(1, 'Adjunta al menos un documento requerido.'),
  firma: z.string().trim().min(1, 'Registra la firma del solicitante.'),
})
