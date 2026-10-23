import type { SolicitudSeguimiento } from '../types'
import type { DocumentoAdjunto } from './documentoAdjunto'

/** Valores exactos del Backend (TipoPersonaDisponibilidadServicios). */
export const TIPOS_PERSONA = ['Persona física', 'Persona jurídica'] as const
export type TipoPersona = (typeof TIPOS_PERSONA)[number]

/** Valores exactos del Backend (CalidadTitularCambioTitular). */
export const CALIDADES_TITULAR = [
  'Propietario',
  'Poseedor',
  'Representante legal',
] as const
export type CalidadTitular = (typeof CALIDADES_TITULAR)[number]

/** Valores exactos del Backend (NaturalezaInmuebleCambioTitular). */
export const NATURALEZAS_INMUEBLE = ['Inscrito', 'Sin inscribir'] as const
export type NaturalezaInmueble = (typeof NATURALEZAS_INMUEBLE)[number]

/**
 * Propósitos confirmados en Backend (PropositoDisponibilidadServiciosConfirmado).
 * Lista PDF oficial completa: BLOCKED.
 */
export const PROPOSITOS = [
  'Fraccionamiento',
  'Urbanización',
  'Propiedades en derechos',
  'Estación de combustible',
] as const
export type Proposito = (typeof PROPOSITOS)[number]

/** Valores exactos del Backend (MedioNotificacionCambioTitular). */
export const MEDIOS_NOTIFICACION = [
  'Correo electrónico',
  'Teléfono',
  'Dirección',
] as const
export type MedioNotificacion = (typeof MEDIOS_NOTIFICACION)[number]

export type DisponibilidadFormValues = {
  tipoPersona: '' | TipoPersona
  nombreFisica: string
  primerApellidoFisica: string
  segundoApellidoFisica: string
  identificacionFisica: string
  telefonoFisica: string
  razonSocial: string
  identificacionJuridica: string
  nombreRepresentante: string
  identificacionRepresentante: string
  telefonoRepresentante: string
  medioNotificacionPrincipal: '' | MedioNotificacion
  valorNotificacionPrincipal: string
  medioNotificacionSecundario: '' | MedioNotificacion
  valorNotificacionSecundario: string
  provincia: string
  canton: string
  distrito: string
  direccionExacta: string
  folioReal: string
  planoCatastrado: string
  planoAgrimensura: string
  nis: string
  naturalezaInmueble: '' | NaturalezaInmueble
  calidadTitular: '' | CalidadTitular
  proposito: '' | Proposito
  numeroDisponibilidadAnterior: string
  descripcionProyecto: string
  cantidadDormitorios: string
  unidadesHabitacionales: string
  areaConstruccion: string
  niveles: string
  caudalRequerido: string
  autorizacionInspeccion: boolean
  firma: string
  documentos: DocumentoAdjunto[]
}

export type DocumentoReferenciaPayload = {
  id: number
  tokenReclamo: string
}

export type DisponibilidadPayload = {
  tipoPersona: TipoPersona
  nombreFisica?: string
  primerApellidoFisica?: string
  segundoApellidoFisica?: string
  identificacionFisica?: string
  telefonoFisica?: string
  razonSocial?: string
  identificacionJuridica?: string
  nombreRepresentante?: string
  identificacionRepresentante?: string
  telefonoRepresentante?: string
  medioNotificacionPrincipal: MedioNotificacion
  valorNotificacionPrincipal?: string
  medioNotificacionSecundario?: MedioNotificacion
  valorNotificacionSecundario?: string
  provincia: string
  canton: string
  distrito: string
  direccionExacta: string
  folioReal?: string
  planoCatastrado?: string
  planoAgrimensura?: string
  nis?: string
  naturalezaInmueble: NaturalezaInmueble
  calidadTitular: CalidadTitular
  proposito: Proposito
  numeroDisponibilidadAnterior?: string
  descripcionProyecto: string
  cantidadDormitorios?: number
  unidadesHabitacionales?: number
  areaConstruccion?: number
  niveles?: number
  caudalRequerido?: number
  autorizacionInspeccion: boolean
  firma?: string
  documentos: DocumentoReferenciaPayload[]
}

export type DisponibilidadResponse = SolicitudSeguimiento & {
  detalleDisponibilidadServicios: {
    id: number
    solicitudId: number
    tipoPersona: TipoPersona
    proposito: Proposito
    descripcionProyecto: string
  }
}

/** Ayuda visible por propósito (documentRequirementsConfig FE + Backend). */
export const REQUISITOS_POR_PROPOSITO: Record<
  Proposito,
  readonly string[]
> = {
  Fraccionamiento: [
    'Documento de identificación',
    'Plano catastrado o plano de agrimensura (referencia + archivo)',
    'Descripción del proyecto',
  ],
  Urbanización: [
    'Documento de identificación',
    'Plano catastrado o plano de agrimensura (referencia + archivo)',
    'Descripción del proyecto',
  ],
  'Propiedades en derechos': [
    'Documento de identificación',
    'Plano catastrado o plano de agrimensura (referencia + archivo)',
    'Descripción del proyecto',
  ],
  'Estación de combustible': [
    'Documento de identificación',
    'Plano catastrado (referencia + archivo)',
    'Poder / autorización',
    'Descripción del proyecto',
  ],
}
