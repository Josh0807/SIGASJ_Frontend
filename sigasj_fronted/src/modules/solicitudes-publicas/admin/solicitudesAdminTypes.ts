import type { SolicitudEstado } from '../types'

export type SolicitudAdmin = {
  id: number
  tipoSolicitudId: number
  codigoSeguimiento: string
  estado: SolicitudEstado
  fechaIngreso: string
  createdAt: string
  updatedAt: string
  tipoSolicitud?: {
    id: number
    nombre: string
    slug: string
    descripcion?: string | null
  } | null
}

export type SolicitudesAdminListResponse = {
  solicitudes: SolicitudAdmin[]
  total: number
}

/** DTO de 4.13.2 — solo campos controlables por el cliente. */
export type CambiarEstadoSolicitudPayload = {
  estadoNuevo: SolicitudEstado
  observacionPublica?: string | null
  notaInterna?: string | null
}

export type CambioEstadoSolicitudResponse = {
  solicitudId: number
  codigoSeguimiento: string
  estadoAnterior: SolicitudEstado | null
  estadoNuevo: SolicitudEstado
  observacionPublica: string | null
  notaInterna: string | null
  idUsuario: number
  fecha: string
  historialId: number
}

/** Evento de GET /solicitudes/:id/historial (admin). notaInterna = solo administrativa. */
export type HistorialSolicitudUsuario = {
  idUsuario: number
  nombre: string
  rol: string | null
}

export type HistorialSolicitudEvento = {
  id: number
  solicitudId: number
  estadoAnterior: SolicitudEstado | null
  estadoNuevo: SolicitudEstado
  observacionPublica: string | null
  notaInterna: string | null
  idUsuario: number | null
  usuario: HistorialSolicitudUsuario | null
  fecha: string
}

