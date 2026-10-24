import { z } from 'zod'
import {
  CALIDADES_TITULAR,
  MEDIOS_NOTIFICACION,
  NATURALEZAS_INMUEBLE,
} from './types'

const requiredLimitedText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Ingresa ${label}.`)
    .max(
      max,
      `${label.charAt(0).toUpperCase()}${label.slice(1)} no puede superar ${max} caracteres.`,
    )

const optionalLimitedText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(
      max,
      `${label.charAt(0).toUpperCase()}${label.slice(1)} no puede superar ${max} caracteres.`,
    )

export const cambioTitularSolicitanteSchema = z.object({
  nombreSolicitante: requiredLimitedText('el nombre completo del solicitante', 150),
  identificacionSolicitante: requiredLimitedText(
    'la identificación del solicitante',
    30,
  ),
  telefono: requiredLimitedText('el teléfono de contacto', 30),
})

export const cambioTitularPropietarioInmuebleSchema = z.object({
  nombrePropietarioRegistral: requiredLimitedText(
    'el nombre del propietario registral',
    150,
  ),
  identificacionPropietario: requiredLimitedText(
    'la identificación del propietario',
    30,
  ),
  folioReal: optionalLimitedText('el folio real', 50),
  planoCatastrado: optionalLimitedText('el plano catastrado', 50),
  planoAgrimensura: optionalLimitedText('el plano de agrimensura', 50),
  naturalezaInmueble: z.enum(NATURALEZAS_INMUEBLE, {
    error: 'Seleccione una naturaleza del inmueble válida.',
  }),
  calidadTitular: z.enum(CALIDADES_TITULAR, {
    error: 'Seleccione una calidad del titular válida.',
  }),
})

export const cambioTitularServicioSchema = z.object({
  nis: requiredLimitedText('el NIS o número de servicio', 50),
  facturaANombreDe: requiredLimitedText(
    'a nombre de quién aparece la factura',
    150,
  ),
})

export const cambioTitularNotificacionesSchema = z.object({
  medioNotificacionPrincipal: z.enum(MEDIOS_NOTIFICACION, {
    error: 'Seleccione un medio de notificación principal válido.',
  }),
  medioNotificacionSecundario: z.union([
    z.literal(''),
    z.enum(MEDIOS_NOTIFICACION),
  ]),
})

export const cambioTitularDocumentosSchema = z.object({
  documentos: z
    .array(z.instanceof(File))
    .min(1, 'Adjunta al menos un documento requerido.'),
  firma: z.string().trim().min(1, 'Registra la firma del nuevo titular solicitante.'),
})
