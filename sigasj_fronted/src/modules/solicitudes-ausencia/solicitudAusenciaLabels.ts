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

/** Colores ASADA: tipo ≠ estado (evita dos naranjas parecidos). */
export const estadoSolicitudAusenciaClassName = (
  estado: EstadoSolicitudAusencia,
): string => {
  if (estado === 'PENDIENTE') {
    return 'border-[color:var(--asada-border-strong,#bfe3fa)] bg-[color:var(--asada-ice,#eaf6ff)] text-[color:var(--asada-navy,#1e5a9c)]'
  }
  if (estado === 'APROBADA') {
    return 'border-[color-mix(in_srgb,var(--color-sigasj-success)_28%,white)] bg-[color-mix(in_srgb,var(--color-sigasj-success)_14%,white)] text-sigasj-success'
  }
  return 'border-[color-mix(in_srgb,var(--color-sigasj-error)_28%,white)] bg-[color-mix(in_srgb,var(--color-sigasj-error)_12%,white)] text-sigasj-error'
}

export const resumirMotivo = (
  motivo: string | null | undefined,
  max = 72,
): string => {
  const texto = motivo?.trim()
  if (!texto) return 'Sin motivo'
  if (texto.length <= max) return texto
  return `${texto.slice(0, Math.max(1, max - 1))}…`
}
