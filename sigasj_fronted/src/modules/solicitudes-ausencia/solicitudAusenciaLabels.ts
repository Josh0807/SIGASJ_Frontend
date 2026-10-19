import type { EstadoSolicitudAusencia, TipoSolicitudAusencia } from './types'

export const tipoSolicitudAusenciaLabel = (tipo: TipoSolicitudAusencia): string =>
  tipo === 'VACACIONES' ? 'Vacaciones' : 'Permiso'

export const estadoSolicitudAusenciaLabel = (
  estado: EstadoSolicitudAusencia,
): string => {
  if (estado === 'PENDIENTE') return 'Pendiente'
  if (estado === 'APROBADA') return 'Aprobada'
  return 'Rechazada'
}

export const estadoSolicitudAusenciaClassName = (
  estado: EstadoSolicitudAusencia,
): string => {
  if (estado === 'PENDIENTE') {
    return 'border-amber-200 bg-amber-50 text-amber-900'
  }
  if (estado === 'APROBADA') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-900'
  }
  return 'border-rose-200 bg-rose-50 text-rose-900'
}

export const resumirMotivo = (
  motivo: string | null | undefined,
  max = 80,
): string => {
  const texto = motivo?.trim()
  if (!texto) return 'Sin motivo'
  if (texto.length <= max) return texto
  return `${texto.slice(0, max - 1)}…`
}
