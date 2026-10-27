import { z } from 'zod'
import {
  cedulaFisicaSchema,
  telefonoCostaRicaSchema,
} from '../identificacionCostaRica'
import {
  CALIDADES_TITULAR,
  MEDIOS_NOTIFICACION,
  MOTIVOS,
  NATURALEZAS_INMUEBLE,
  TIPOS_SERVICIO,
} from './types'

const required = (label: string, max = 200) =>
  z.string().trim().min(1, `Ingresa ${label}.`).max(max, `No puede superar ${max} caracteres.`)
const optional = (max = 200) => z.string().trim().max(max, `No puede superar ${max} caracteres.`)

export const servicioSolicitanteSchema = z.object({
  tipoServicio: z.enum(TIPOS_SERVICIO, { error: 'Selecciona el tipo de servicio.' }),
  nis: required('el NIS', 50),
  propietarioInmueble: required('el propietario del inmueble'),
  nombreSolicitante: required('el nombre del solicitante'),
  identificacionSolicitante: cedulaFisicaSchema('la identificación'),
  correoElectronico: z.string().trim().min(1, 'Ingresa el correo electrónico.').email('Ingresa un correo electrónico válido.').max(150),
  telefono: telefonoCostaRicaSchema('el teléfono'),
})

export const servicioInmuebleSchema = z.object({
  naturalezaInmueble: z.enum(NATURALEZAS_INMUEBLE, { error: 'Selecciona la naturaleza del inmueble.' }),
  calidadTitular: z.enum(CALIDADES_TITULAR, { error: 'Selecciona la calidad del titular.' }),
  folioReal: optional(50),
  planoCatastrado: optional(50),
  planoAgrimensura: optional(50),
}).superRefine((data, ctx) => {
  if (!data.folioReal && !data.planoCatastrado && !data.planoAgrimensura) {
    ctx.addIssue({ code: 'custom', path: ['folioReal'], message: 'Ingresa al menos una referencia registral o de plano.' })
  }
})

export const servicioUbicacionSchema = z.object({
  provincia: required('la provincia', 80),
  canton: required('el cantón', 80),
  distrito: required('el distrito', 80),
  direccionExacta: required('la dirección exacta', 500),
})

export const servicioMotivoSchema = z.object({
  motivo: z.enum(MOTIVOS, { error: 'Selecciona el motivo de la constancia.' }),
  otroMotivo: z.string(),
  tramitePorRealizar: required('el trámite por realizar', 1000),
}).superRefine((data, ctx) => {
  if (data.motivo === 'Otro' && !data.otroMotivo.trim()) {
    ctx.addIssue({ code: 'custom', path: ['otroMotivo'], message: 'Especifica el otro motivo.' })
  }
  if (data.otroMotivo.trim().length > 300) {
    ctx.addIssue({ code: 'custom', path: ['otroMotivo'], message: 'No puede superar 300 caracteres.' })
  }
})

export const servicioNotificacionesSchema = z.object({
  medioNotificacionPrincipal: z.enum(MEDIOS_NOTIFICACION, { error: 'Selecciona el medio principal.' }),
  medioNotificacionSecundario: z.union([z.literal(''), z.enum(MEDIOS_NOTIFICACION)]),
}).superRefine((data, ctx) => {
  if (data.medioNotificacionSecundario && data.medioNotificacionSecundario === data.medioNotificacionPrincipal) {
    ctx.addIssue({ code: 'custom', path: ['medioNotificacionSecundario'], message: 'El medio secundario debe ser diferente del principal.' })
  }
})

export const servicioDocumentosFirmaSchema = z.object({
  documentos: z.array(z.object({
    tipoDocumento: z.enum(['identificacion', 'poder']),
    estado: z.enum(['subiendo', 'cargado', 'error']),
    id: z.number().optional(),
    tokenReclamo: z.string().optional(),
  }).passthrough()),
  calidadTitular: z.string(),
  firma: z.string().min(1, 'Registra la firma del solicitante.'),
}).superRefine((data, ctx) => {
  if (data.documentos.some((doc) => doc.estado === 'subiendo')) {
    ctx.addIssue({ code: 'custom', path: ['documentos'], message: 'Espera a que terminen de cargarse los documentos.' })
    return
  }
  if (data.documentos.some((doc) => doc.estado === 'error')) {
    ctx.addIssue({ code: 'custom', path: ['documentos'], message: 'Elimina o vuelve a cargar los documentos con error.' })
    return
  }
  const cargados = new Set(data.documentos.filter((doc) => doc.estado === 'cargado' && doc.id && doc.tokenReclamo).map((doc) => doc.tipoDocumento))
  if (!cargados.has('identificacion')) {
    ctx.addIssue({ code: 'custom', path: ['documentos'], message: 'Adjunta el documento de identificación.' })
  }
  if (data.calidadTitular === 'Representante legal' && !cargados.has('poder')) {
    ctx.addIssue({ code: 'custom', path: ['documentos'], message: 'Adjunta el poder o autorización para la representación legal.' })
  }
})
