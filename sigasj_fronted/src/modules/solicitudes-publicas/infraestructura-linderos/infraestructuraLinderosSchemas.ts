import { z } from 'zod'
import {
  tiposRequeridosParaProposito,
  type DocumentoAdjunto,
} from './documentoAdjunto'
import {
  CALIDADES_TITULAR,
  MEDIOS_NOTIFICACION,
  PROPOSITOS,
  TIPOS_PERSONA,
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

export const infraestructuraServicioTitularSchema = z
  .object({
    nis: requiredLimitedText('el NIS o número de servicio', 50),
    tipoPersona: z.enum(TIPOS_PERSONA, {
      error: 'Seleccione el tipo de persona.',
    }),
    nombreFisica: z.string(),
    apellidosFisica: z.string(),
    identificacionFisica: z.string(),
    telefonoFisica: z.string(),
    razonSocial: z.string(),
    cedulaJuridica: z.string(),
    nombreRepresentante: z.string(),
    identificacionRepresentante: z.string(),
    telefonoRepresentante: z.string(),
    calidadTitular: z.enum(CALIDADES_TITULAR, {
      error: 'Seleccione una calidad del titular válida.',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.tipoPersona === 'Persona física') {
      const fields: Array<[keyof typeof data, string, number]> = [
        ['nombreFisica', 'el nombre', 100],
        ['apellidosFisica', 'los apellidos', 100],
        ['identificacionFisica', 'la identificación', 30],
        ['telefonoFisica', 'el teléfono', 30],
      ]
      for (const [key, label, max] of fields) {
        const value = String(data[key] ?? '').trim()
        if (!value) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `Ingresa ${label}.`,
          })
        } else if (value.length > max) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `No puede superar ${max} caracteres.`,
          })
        }
      }
    }

    if (data.tipoPersona === 'Persona jurídica') {
      const fields: Array<[keyof typeof data, string, number]> = [
        ['razonSocial', 'la razón social', 200],
        ['cedulaJuridica', 'la cédula jurídica', 30],
        ['nombreRepresentante', 'el nombre del representante', 150],
        [
          'identificacionRepresentante',
          'la identificación del representante',
          30,
        ],
        ['telefonoRepresentante', 'el teléfono del representante', 30],
      ]
      for (const [key, label, max] of fields) {
        const value = String(data[key] ?? '').trim()
        if (!value) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `Ingresa ${label}.`,
          })
        } else if (value.length > max) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `No puede superar ${max} caracteres.`,
          })
        }
      }
    }
  })

export const infraestructuraInmuebleSchema = z.object({
  provincia: requiredLimitedText('la provincia', 80),
  canton: requiredLimitedText('el cantón', 80),
  distrito: requiredLimitedText('el distrito', 80),
  direccionExacta: requiredLimitedText('la dirección exacta', 500),
  folioReal: optionalLimitedText('el folio real', 50),
  planoCatastrado: requiredLimitedText('el plano catastrado', 50),
  planoAgrimensura: optionalLimitedText('el plano de agrimensura', 50),
})

export const infraestructuraPropositoSchema = z
  .object({
    proposito: z.enum(PROPOSITOS, {
      error: 'Seleccione un propósito válido.',
    }),
    planoAgrimensura: z.string(),
  })
  .superRefine((data, ctx) => {
    if (
      data.proposito === 'Reunión de fincas' &&
      !data.planoAgrimensura.trim()
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['planoAgrimensura'],
        message:
          'El plano de agrimensura es obligatorio cuando el propósito es Reunión de fincas.',
      })
    } else if (data.planoAgrimensura.trim().length > 50) {
      ctx.addIssue({
        code: 'custom',
        path: ['planoAgrimensura'],
        message: 'El plano de agrimensura no puede superar 50 caracteres.',
      })
    }
  })

export const infraestructuraNotificacionesSchema = z
  .object({
    medioNotificacionPrincipal: z.enum(MEDIOS_NOTIFICACION, {
      error: 'Seleccione un medio de notificación principal válido.',
    }),
    valorNotificacionPrincipal: optionalLimitedText(
      'el destino de notificación principal',
      200,
    ),
    medioNotificacionSecundario: z.union([
      z.literal(''),
      z.enum(MEDIOS_NOTIFICACION),
    ]),
    valorNotificacionSecundario: optionalLimitedText(
      'el destino de notificación secundario',
      200,
    ),
  })
  .superRefine((data, ctx) => {
    const emailSimple = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (
      data.medioNotificacionPrincipal === 'Correo electrónico' &&
      data.valorNotificacionPrincipal.trim() &&
      !emailSimple.test(data.valorNotificacionPrincipal.trim())
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['valorNotificacionPrincipal'],
        message: 'Ingresa un correo electrónico válido.',
      })
    }
    if (
      data.medioNotificacionSecundario === 'Correo electrónico' &&
      data.valorNotificacionSecundario.trim() &&
      !emailSimple.test(data.valorNotificacionSecundario.trim())
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['valorNotificacionSecundario'],
        message: 'Ingresa un correo electrónico válido.',
      })
    }
  })

const documentoAdjuntoSchema = z.object({
  localId: z.string(),
  tipoDocumento: z.enum([
    'identificacion',
    'plano-catastrado',
    'poder',
    'plano-agrimensura',
  ]),
  nombreOriginal: z.string(),
  tamanio: z.number(),
  tipoArchivo: z.string(),
  estado: z.enum(['subiendo', 'cargado', 'error']),
  id: z.number().optional(),
  tokenReclamo: z.string().optional(),
  errorMessage: z.string().optional(),
})

export const infraestructuraDocumentosSchema = z
  .object({
    proposito: z.string(),
    documentos: z.array(documentoAdjuntoSchema),
    firma: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.documentos.some((doc) => doc.estado === 'subiendo')) {
      ctx.addIssue({
        code: 'custom',
        path: ['documentos'],
        message: 'Espere a que terminen de cargarse todos los documentos.',
      })
      return
    }
    if (data.documentos.some((doc) => doc.estado === 'error')) {
      ctx.addIssue({
        code: 'custom',
        path: ['documentos'],
        message:
          'Hay documentos con error de carga. Elimínelos o vuelva a subirlos.',
      })
      return
    }

    const cargados = data.documentos.filter(
      (doc): doc is DocumentoAdjunto & { id: number; tokenReclamo: string } =>
        doc.estado === 'cargado' &&
        typeof doc.id === 'number' &&
        Boolean(doc.tokenReclamo),
    )
    if (cargados.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['documentos'],
        message: 'Debe cargar al menos un documento requerido.',
      })
      return
    }

    const tipos = new Set(cargados.map((doc) => doc.tipoDocumento))
    for (const requerido of tiposRequeridosParaProposito(data.proposito)) {
      if (!tipos.has(requerido)) {
        ctx.addIssue({
          code: 'custom',
          path: ['documentos'],
          message: `Falta el documento requerido: ${requerido}.`,
        })
      }
    }
  })
