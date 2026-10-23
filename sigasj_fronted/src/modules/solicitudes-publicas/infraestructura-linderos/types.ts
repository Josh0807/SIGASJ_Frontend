import type { SolicitudSeguimiento } from '../types'
import type { DocumentoAdjunto } from './documentoAdjunto'

/** Valores exactos del Backend (TipoPersonaInfraestructuraLinderos). */
export const TIPOS_PERSONA = ['Persona física', 'Persona jurídica'] as const
export type TipoPersona = (typeof TIPOS_PERSONA)[number]

/** Valores exactos del Backend (CalidadTitularCambioTitular). */
export const CALIDADES_TITULAR = [
  'Propietario',
  'Poseedor',
  'Representante legal',
] as const
export type CalidadTitular = (typeof CALIDADES_TITULAR)[number]

/**
 * Propósitos confirmados en Backend (PropositoInfraestructuraLinderosConfirmado).
 * INFRA-QA-002: segundo propósito BLOCKED — no hay PDF oficial en el repo.
 */
export const PROPOSITOS = ['Reunión de fincas'] as const
export type Proposito = (typeof PROPOSITOS)[number]

/** Valores exactos del Backend (MedioNotificacionCambioTitular). */
export const MEDIOS_NOTIFICACION = [
  'Correo electrónico',
  'Teléfono',
  'Dirección',
] as const
export type MedioNotificacion = (typeof MEDIOS_NOTIFICACION)[number]

export type InfraestructuraLinderosFormValues = {
  nis: string
  tipoPersona: '' | TipoPersona
  nombreFisica: string
  apellidosFisica: string
  identificacionFisica: string
  telefonoFisica: string
  razonSocial: string
  cedulaJuridica: string
  nombreRepresentante: string
  identificacionRepresentante: string
  telefonoRepresentante: string
  calidadTitular: '' | CalidadTitular
  provincia: string
  canton: string
  distrito: string
  direccionExacta: string
  folioReal: string
  planoCatastrado: string
  planoAgrimensura: string
  proposito: '' | Proposito
  medioNotificacionPrincipal: '' | MedioNotificacion
  valorNotificacionPrincipal: string
  medioNotificacionSecundario: '' | MedioNotificacion
  valorNotificacionSecundario: string
  firma: string
  /** Adjuntos con referencia real (id + token) tras upload; no File crudos. */
  documentos: DocumentoAdjunto[]
}

export type DocumentoReferenciaPayload = {
  id: number
  tokenReclamo: string
}

export type InfraestructuraLinderosPayload = {
  nis: string
  tipoPersona: TipoPersona
  nombreFisica?: string
  apellidosFisica?: string
  identificacionFisica?: string
  telefonoFisica?: string
  razonSocial?: string
  cedulaJuridica?: string
  nombreRepresentante?: string
  identificacionRepresentante?: string
  telefonoRepresentante?: string
  calidadTitular: CalidadTitular
  provincia: string
  canton: string
  distrito: string
  direccionExacta: string
  folioReal?: string
  planoCatastrado: string
  planoAgrimensura?: string
  proposito: Proposito
  medioNotificacionPrincipal: MedioNotificacion
  valorNotificacionPrincipal?: string
  medioNotificacionSecundario?: MedioNotificacion
  valorNotificacionSecundario?: string
  firma?: string
  documentos: DocumentoReferenciaPayload[]
}

export type InfraestructuraLinderosResponse = SolicitudSeguimiento & {
  detalleInfraestructuraLinderos: {
    id: number
    solicitudId: number
    nis: string
    tipoPersona: TipoPersona
    proposito: Proposito
    calidadTitular: CalidadTitular
  }
}
