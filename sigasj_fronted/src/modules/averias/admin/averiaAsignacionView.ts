import type { AveriaDetail } from './types'

export const AVERIA_RECIBIDA_ANTES_ASIGNAR_MSG =
  'Al asignar el fontanero, el reporte pasa a revisión y queda en su listado.'

export const ESTADOS_FORMULARIO_ASIGNACION = [
  'RECIBIDA',
  'EN_REVISION',
  'PENDIENTE',
] as const

export type AveriaAsignacionView =
  | 'formulario'
  | 'asignada'
  | 'solo_lectura'

export function estadoPermiteFormularioAsignacion(estado: string): boolean {
  return (ESTADOS_FORMULARIO_ASIGNACION as readonly string[]).includes(estado)
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

  if (estadoPermiteFormularioAsignacion(estado)) {
    return 'formulario'
  }

  return 'solo_lectura'
}

export function formatFontaneroIdLabel(fontaneroId: number): string {
  return `Fontanero #${fontaneroId}`
}
