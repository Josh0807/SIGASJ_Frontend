import type { SolicitudSeguimiento } from '../types'

/** Valores exactos del Backend (NaturalezaInmuebleCambioTitular). */
export const NATURALEZAS_INMUEBLE = ['Inscrito', 'Sin inscribir'] as const
export type NaturalezaInmueble = (typeof NATURALEZAS_INMUEBLE)[number]

/** Valores exactos del Backend (CalidadTitularCambioTitular). */
export const CALIDADES_TITULAR = [
  'Propietario',
  'Poseedor',
  'Representante legal',
] as const
export type CalidadTitular = (typeof CALIDADES_TITULAR)[number]

/** Valores exactos del Backend (MedioNotificacionCambioTitular). */
export const MEDIOS_NOTIFICACION = [
  'Correo electrónico',
  'Teléfono',
  'Dirección',
] as const
export type MedioNotificacion = (typeof MEDIOS_NOTIFICACION)[number]

export type CambioTitularFormValues = {
  nombreSolicitante: string
  identificacionSolicitante: string
  telefono: string
  nombrePropietarioRegistral: string
  identificacionPropietario: string
  folioReal: string
  planoCatastrado: string
  planoAgrimensura: string
  naturalezaInmueble: '' | NaturalezaInmueble
  calidadTitular: '' | CalidadTitular
  nis: string
  facturaANombreDe: string
  medioNotificacionPrincipal: '' | MedioNotificacion
  medioNotificacionSecundario: '' | MedioNotificacion
  firma: string
  documentos: File[]
}

export type CambioTitularPayload = {
  nombreSolicitante: string
  identificacionSolicitante: string
  telefono: string
  nombrePropietarioRegistral: string
  identificacionPropietario: string
  folioReal?: string
  planoCatastrado?: string
  planoAgrimensura?: string
  naturalezaInmueble: NaturalezaInmueble
  calidadTitular: CalidadTitular
  nis: string
  facturaANombreDe: string
  medioNotificacionPrincipal: MedioNotificacion
  medioNotificacionSecundario?: MedioNotificacion
  firma?: string
}

export type CambioTitularResponse = SolicitudSeguimiento & {
  detalleCambioTitular: {
    id: number
    solicitudId: number
    nombreSolicitante: string
    identificacionSolicitante: string
    telefono: string
    nombrePropietarioRegistral: string
    identificacionPropietario: string
    folioReal: string | null
    planoCatastrado: string | null
    planoAgrimensura: string | null
    naturalezaInmueble: NaturalezaInmueble
    calidadTitular: CalidadTitular
    nis: string
    facturaANombreDe: string
    medioNotificacionPrincipal: MedioNotificacion
    medioNotificacionSecundario: MedioNotificacion | null
    firma: string | null
  }
}
