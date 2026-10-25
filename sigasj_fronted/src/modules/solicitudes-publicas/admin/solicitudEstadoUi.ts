import { SOLICITUD_ESTADO_LABELS, type SolicitudEstado } from '../types'

export const SOLICITUD_ESTADOS = Object.keys(
  SOLICITUD_ESTADO_LABELS,
) as SolicitudEstado[]

export const labelEstadoSolicitud = (estado: SolicitudEstado | string): string =>
  SOLICITUD_ESTADO_LABELS[estado as SolicitudEstado] ?? String(estado)

/** Estados seleccionables: oficiales excepto el actual (Backend rechaza no-op). */
export const estadosDisponiblesParaCambio = (
  estadoActual: SolicitudEstado,
): SolicitudEstado[] => SOLICITUD_ESTADOS.filter((estado) => estado !== estadoActual)

export const claseBadgeEstadoSolicitud = (estado: SolicitudEstado | string): string => {
  switch (estado) {
    case 'PENDIENTE':
      return 'border-amber-200 bg-amber-50 text-amber-800'
    case 'EN_REVISION':
      return 'border-sky-200 bg-sky-50 text-sky-800'
    case 'APROBADA':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    case 'RECHAZADA':
      return 'border-rose-200 bg-rose-50 text-rose-800'
    case 'FINALIZADA':
      return 'border-slate-200 bg-slate-100 text-slate-700'
    case 'CANCELADA':
      return 'border-slate-300 bg-slate-50 text-slate-600'
    default:
      return 'border-slate-200 bg-white text-slate-700'
  }
}
