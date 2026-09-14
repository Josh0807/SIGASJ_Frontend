import type { AveriaDetail } from './types'

export const AVERIA_RECIBIDA_ANTES_ASIGNAR_MSG =
  'La avería debe estar en revisión antes de poder asignarse.'

export const ESTADOS_FORMULARIO_ASIGNACION = ['EN_REVISION', 'PENDIENTE'] as const

export type AveriaAsignacionView =
  | 'formulario'
  | 'asignada'
  | 'recibida_info'
  | 'solo_lectura'

export function estadoPermiteFormularioAsignacion(estado: string): boolean {
  return (
    estado === 'EN_REVISION' ||
    estado === 'PENDIENTE'
  )
}

export function puedeAsignarFontaneroAveria(averia: AveriaDetail): boolean {
  if (averia.fontanero != null) {
    return false
  }
  return estadoPermiteFormularioAsignacion(String(averia.estado))
}

export function getAveriaAsignacionView(
  averia: AveriaDetail,
  canAssign: boolean,
): AveriaAsignacionView {
  if (averia.fontanero != null) {
    return 'asignada'
  }

  const estado = String(averia.estado)

  if (estado === 'RESUELTA' || estado === 'CANCELADA') {
    return 'solo_lectura'
  }

  if (estado === 'ASIGNADA' || estado === 'EN_ATENCION') {
    return 'asignada'
  }

  if (!canAssign) {
    return 'solo_lectura'
  }

  if (estado === 'RECIBIDA') {
    return 'recibida_info'
  }

  if (estadoPermiteFormularioAsignacion(estado)) {
    return 'formulario'
  }

  return 'solo_lectura'
}

export function formatFontaneroIdLabel(fontaneroId: number): string {
  return `Fontanero #${fontaneroId}`
}
