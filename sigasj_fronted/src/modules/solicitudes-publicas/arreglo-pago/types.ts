import type { SolicitudSeguimiento } from '../types'

export const PLAZOS_ARREGLO_PAGO = [
  '1 mes',
  '2 meses',
  '3 meses',
  '6 meses',
  '9 meses',
  '12 meses',
  '18 meses',
  '24 meses',
] as const

export type PlazoArregloPago = (typeof PLAZOS_ARREGLO_PAGO)[number]

export type ArregloPagoFormValues = {
  nombre: string
  cedula: string
  vecinoDe: string
  telefono: string
  numeroCuentaServicio: string
  montoPrimaInicial: string
  plazoSeleccionado: '' | PlazoArregloPago
  firma: string
  documentos: File[]
}

export type ArregloPagoPayload = {
  nombre: string
  cedula: string
  vecinoDe: string
  telefono: string
  numeroCuentaServicio: string
  montoPrimaInicial: number
  plazoSeleccionado: PlazoArregloPago
  firma?: string
}

export type ArregloPagoResponse = SolicitudSeguimiento & {
  detalleArregloPago: {
    id: number
    solicitudId: number
    nombre: string
    cedula: string
    vecinoDe: string
    telefono: string
    numeroCuentaServicio: string
    montoPrimaInicial: number
    plazoSeleccionado: PlazoArregloPago
    firma: string | null
  }
}
