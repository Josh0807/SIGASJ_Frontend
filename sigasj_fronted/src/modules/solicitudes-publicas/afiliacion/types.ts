import type { SolicitudSeguimiento } from '../types'

/**
 * Valores del formulario alineados a CreateSolicitudAfiliacionDto (Backend 4.7.2).
 * estadoCivil: texto libre — catálogo oficial BLOCKED (PDF ausente).
 * Firmas: opcionales (mismo contrato Backend).
 */
export type AfiliacionFormValues = {
  fechaSolicitud: string
  nombre: string
  identificacion: string
  vecinoDe: string
  estadoCivil: string
  telefono: string
  correoElectronico: string
  numeroAbonado: string
  numeroPlano: string
  folioReal: string
  firmaSolicitante: string
  recomendacion1Nombre: string
  recomendacion1Identificacion: string
  recomendacion1NumeroAbonado: string
  recomendacion1Firma: string
  recomendacion2Nombre: string
  recomendacion2Identificacion: string
  recomendacion2NumeroAbonado: string
  recomendacion2Firma: string
}

export type AfiliacionPayload = {
  fechaSolicitud: string
  nombre: string
  identificacion: string
  vecinoDe: string
  estadoCivil: string
  telefono: string
  correoElectronico: string
  numeroAbonado: string
  numeroPlano: string
  folioReal?: string
  firmaSolicitante?: string
  recomendacion1Nombre: string
  recomendacion1Identificacion: string
  recomendacion1NumeroAbonado: string
  recomendacion1Firma?: string
  recomendacion2Nombre: string
  recomendacion2Identificacion: string
  recomendacion2NumeroAbonado: string
  recomendacion2Firma?: string
}

export type AfiliacionResponse = SolicitudSeguimiento & {
  detalleAfiliacion: {
    id: number
    solicitudId: number
    nombre: string
    identificacion: string
    numeroAbonado: string
    recomendacion1Nombre: string
    recomendacion2Nombre: string
  }
}
