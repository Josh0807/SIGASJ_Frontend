import { z } from 'zod'

const requiredLimitedText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Ingresa ${label}.`)
    .max(max, `${label.charAt(0).toUpperCase()}${label.slice(1)} no puede exceder ${max} caracteres.`)

const optionalLimitedText = (max: number) =>
  z.string().trim().max(max, `No puede exceder ${max} caracteres.`)

const emailSimple = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const afiliacionPersonalesSchema = z.object({
  fechaSolicitud: z
    .string()
    .trim()
    .min(1, 'La fecha de solicitud es obligatoria.')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresa una fecha válida (AAAA-MM-DD).'),
  nombre: requiredLimitedText('el nombre completo', 150),
  identificacion: requiredLimitedText('la identificación', 30),
  vecinoDe: requiredLimitedText('el vecino de / lugar de residencia', 200),
  estadoCivil: requiredLimitedText('el estado civil', 40),
  telefono: requiredLimitedText('el teléfono', 30),
  correoElectronico: z
    .string()
    .trim()
    .min(1, 'Ingresa el correo electrónico.')
    .max(150, 'El correo electrónico no puede exceder 150 caracteres.')
    .refine((value) => emailSimple.test(value), {
      message: 'Ingresa un correo electrónico válido.',
    }),
})

export const afiliacionAbonadoInmuebleSchema = z.object({
  numeroAbonado: requiredLimitedText('el número de abonado', 50),
  numeroPlano: requiredLimitedText('el número de plano', 50),
  folioReal: optionalLimitedText(50),
})

export const afiliacionRecomendacion1Schema = z.object({
  recomendacion1Nombre: requiredLimitedText(
    'el nombre del recomendante 1',
    150,
  ),
  recomendacion1Identificacion: requiredLimitedText(
    'la identificación del recomendante 1',
    30,
  ),
  recomendacion1NumeroAbonado: requiredLimitedText(
    'el número de abonado del recomendante 1',
    50,
  ),
  recomendacion1Firma: z.string(),
})

export const afiliacionRecomendacion2Schema = z.object({
  recomendacion2Nombre: requiredLimitedText(
    'el nombre del recomendante 2',
    150,
  ),
  recomendacion2Identificacion: requiredLimitedText(
    'la identificación del recomendante 2',
    30,
  ),
  recomendacion2NumeroAbonado: requiredLimitedText(
    'el número de abonado del recomendante 2',
    50,
  ),
  recomendacion2Firma: z.string(),
})

/** Firma del solicitante: opcional (Backend 4.7.2). */
export const afiliacionFirmaSchema = z.object({
  firmaSolicitante: z.string(),
})
