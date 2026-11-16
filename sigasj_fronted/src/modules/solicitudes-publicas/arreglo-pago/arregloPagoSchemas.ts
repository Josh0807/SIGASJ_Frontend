import { z } from 'zod'
import {
  cedulaFisicaSchema,
  telefonoCostaRicaSchema,
} from '../identificacionCostaRica'
import { PLAZOS_ARREGLO_PAGO } from './types'

const requiredLimitedText = (label: string, max: number) =>
  z.string().trim().min(1, `Ingresa ${label}.`).max(max, `${label.charAt(0).toUpperCase()}${label.slice(1)} no puede superar ${max} caracteres.`)

export const arregloPagoApplicantSchema = z.object({
  nombre: requiredLimitedText('el nombre completo', 150),
  cedula: cedulaFisicaSchema('la cédula o identificación'),
  vecinoDe: requiredLimitedText('la dirección o lugar de residencia', 200),
  telefono: telefonoCostaRicaSchema('el teléfono de contacto'),
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
  documentos: z.array(z.object({
    tipoDocumento: z.literal('identificacion'),
    estado: z.enum(['pendiente', 'subiendo', 'cargado', 'error']),
    id: z.number().optional(),
    tokenReclamo: z.string().optional(),
  })).superRefine((documentos, context) => {
    if (!documentos.some((documento) => documento.tipoDocumento === 'identificacion')) {
      context.addIssue({ code: 'custom', message: 'Adjunta el documento de identificación.' })
    }
    if (documentos.some((documento) => documento.estado === 'pendiente' || documento.estado === 'subiendo')) {
      context.addIssue({ code: 'custom', message: 'Espera a que finalice la carga del documento.' })
    }
    if (documentos.some((documento) => documento.estado === 'error')) {
      context.addIssue({ code: 'custom', message: 'Reintenta o elimina los documentos con error.' })
    }
    if (!documentos.some((documento) => documento.estado === 'cargado' && documento.id && documento.tokenReclamo)) {
      context.addIssue({ code: 'custom', message: 'El documento obligatorio debe terminar de cargarse.' })
    }
  }),
  firma: z.string().trim().min(1, 'Registra la firma del solicitante.'),
})
