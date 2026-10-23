import { z } from 'zod'
import {
  requiereAlgunPlanoAdjunto,
  tiposEstrictosDisponibilidad,
  type DocumentoAdjunto,
} from './documentoAdjunto'
import {
  CALIDADES_TITULAR,
  MEDIOS_NOTIFICACION,
  NATURALEZAS_INMUEBLE,
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

const optionalNonNegativeInt = (label: string) =>
  z
    .string()
    .trim()
    .refine(
      (value) => {
        if (!value) return true
        if (!/^\d+$/.test(value)) return false
        return Number(value) >= 0
      },
      { message: `${label} debe ser un entero mayor o igual a 0.` },
    )

const optionalNonNegativeDecimal = (label: string, maxDecimals: number) =>
  z
    .string()
    .trim()
    .refine(
      (value) => {
        if (!value) return true
        const pattern = new RegExp(`^\\d+(\\.\\d{1,${maxDecimals}})?$`)
        if (!pattern.test(value)) return false
        return Number(value) >= 0
      },
      {
        message: `${label} debe ser un número ≥ 0 con hasta ${maxDecimals} decimales.`,
      },
    )

export const disponibilidadSolicitanteSchema = z
  .object({
    tipoPersona: z.enum(TIPOS_PERSONA, {
      error: 'Seleccione el tipo de persona.',
    }),
    nombreFisica: z.string(),
    primerApellidoFisica: z.string(),
    segundoApellidoFisica: z.string(),
    identificacionFisica: z.string(),
    telefonoFisica: z.string(),
    razonSocial: z.string(),
    identificacionJuridica: z.string(),
    nombreRepresentante: z.string(),
    identificacionRepresentante: z.string(),
    telefonoRepresentante: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.tipoPersona === 'Persona física') {
      const fields: Array<[keyof typeof data, string, number]> = [
        ['nombreFisica', 'el nombre', 100],
        ['primerApellidoFisica', 'el primer apellido', 100],
        ['segundoApellidoFisica', 'el segundo apellido', 100],
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
        ['identificacionJuridica', 'la identificación jurídica', 30],
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

export const disponibilidadNotificacionesSchema = z
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

export const disponibilidadInmuebleSchema = z
  .object({
    provincia: requiredLimitedText('la provincia', 80),
    canton: requiredLimitedText('el cantón', 80),
    distrito: requiredLimitedText('el distrito', 80),
    direccionExacta: requiredLimitedText('la dirección exacta', 500),
    folioReal: optionalLimitedText('el folio real', 50),
    planoCatastrado: optionalLimitedText('el plano catastrado', 50),
    planoAgrimensura: optionalLimitedText('el plano de agrimensura', 50),
    nis: optionalLimitedText('el NIS', 50),
  })
  .superRefine((data, ctx) => {
    if (!data.planoCatastrado.trim() && !data.planoAgrimensura.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['planoCatastrado'],
        message:
          'Debe indicar plano catastrado o plano de agrimensura (referencia textual).',
      })
    }
  })

export const disponibilidadNaturalezaCalidadSchema = z.object({
  naturalezaInmueble: z.enum(NATURALEZAS_INMUEBLE, {
    error: 'Seleccione una naturaleza del inmueble válida.',
  }),
  calidadTitular: z.enum(CALIDADES_TITULAR, {
    error: 'Seleccione una calidad del titular válida.',
  }),
})

export const disponibilidadPropositoSchema = z
  .object({
    proposito: z.enum(PROPOSITOS, {
      error: 'Seleccione un propósito válido.',
    }),
    numeroDisponibilidadAnterior: optionalLimitedText(
      'el número de disponibilidad anterior',
      50,
    ),
    planoCatastrado: z.string(),
    planoAgrimensura: z.string(),
  })
  .superRefine((data, ctx) => {
    if (
      data.proposito === 'Estación de combustible' &&
      !data.planoCatastrado.trim()
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['planoCatastrado'],
        message:
          'El propósito Estación de combustible requiere referencia de plano catastrado.',
      })
    }
    if (
      requiereAlgunPlanoAdjunto(data.proposito) &&
      !data.planoCatastrado.trim() &&
      !data.planoAgrimensura.trim()
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['planoAgrimensura'],
        message:
          'Este propósito requiere plano catastrado o plano de agrimensura.',
      })
    }
  })

export const disponibilidadProyectoSchema = z.object({
  descripcionProyecto: requiredLimitedText('la descripción del proyecto', 2000),
  cantidadDormitorios: optionalNonNegativeInt('La cantidad de dormitorios'),
  unidadesHabitacionales: optionalNonNegativeInt(
    'Las unidades habitacionales',
  ),
  areaConstruccion: optionalNonNegativeDecimal('El área de construcción', 2),
  niveles: optionalNonNegativeInt('Los niveles'),
  caudalRequerido: optionalNonNegativeDecimal('El caudal requerido', 4),
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

export const disponibilidadDocumentosSchema = z
  .object({
    proposito: z.string(),
    calidadTitular: z.string(),
    planoCatastrado: z.string(),
    documentos: z.array(documentoAdjuntoSchema),
    autorizacionInspeccion: z.boolean({
      error: 'Indique si autoriza la inspección.',
    }),
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
    for (const requerido of tiposEstrictosDisponibilidad({
      proposito: data.proposito,
      calidadTitular: data.calidadTitular,
      planoCatastrado: data.planoCatastrado,
    })) {
      if (!tipos.has(requerido)) {
        ctx.addIssue({
          code: 'custom',
          path: ['documentos'],
          message: `Falta el documento requerido: ${requerido}.`,
        })
      }
    }

    if (requiereAlgunPlanoAdjunto(data.proposito)) {
      const tienePlano =
        tipos.has('plano-catastrado') || tipos.has('plano-agrimensura')
      if (!tienePlano) {
        ctx.addIssue({
          code: 'custom',
          path: ['documentos'],
          message:
            'Debe adjuntar plano catastrado o plano de agrimensura según el propósito.',
        })
      }
    }
  })

export const disponibilidadFirmaSchema = z.object({
  firma: z.string(),
})
