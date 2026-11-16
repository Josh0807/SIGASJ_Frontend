import { z } from 'zod'
import {
  cedulaFisicaSchema,
  telefonoCostaRicaSchema,
} from '../identificacionCostaRica'
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
  identificacionSolicitante: cedulaFisicaSchema(
    'la identificación del solicitante',
  ),
  telefono: telefonoCostaRicaSchema('el teléfono de contacto'),
})

export const cambioTitularPropietarioInmuebleSchema = z.object({
  nombrePropietarioRegistral: requiredLimitedText(
    'el nombre del propietario registral',
    150,
  ),
  identificacionPropietario: cedulaFisicaSchema(
    'la identificación del propietario',
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
  calidadTitular: z.string(),
  documentos: z.array(z.object({
    tipoDocumento: z.enum(['identificacion', 'poder', 'otro']),
    estado: z.enum(['pendiente', 'subiendo', 'cargado', 'error']),
    id: z.number().optional(),
    tokenReclamo: z.string().optional(),
  })),
  firma: z.string().trim().min(1, 'Registra la firma del nuevo titular solicitante.'),
}).superRefine((values, context) => {
  const cargados = values.documentos.filter((documento) =>
    documento.estado === 'cargado' && documento.id && documento.tokenReclamo,
  )
  if (!cargados.some((documento) => documento.tipoDocumento === 'identificacion')) {
    context.addIssue({ code: 'custom', path: ['documentos'], message: 'Carga el documento de identificación obligatorio.' })
  }
  if (values.calidadTitular === 'Representante legal' && !cargados.some((documento) => documento.tipoDocumento === 'poder')) {
    context.addIssue({ code: 'custom', path: ['documentos'], message: 'Carga el poder o autorización de la persona representante.' })
  }
  if (values.documentos.some((documento) => documento.estado === 'pendiente' || documento.estado === 'subiendo')) {
    context.addIssue({ code: 'custom', path: ['documentos'], message: 'Espera a que finalicen todas las cargas.' })
  }
  if (values.documentos.some((documento) => documento.estado === 'error')) {
    context.addIssue({ code: 'custom', path: ['documentos'], message: 'Reintenta o elimina los documentos con error.' })
  }
})
