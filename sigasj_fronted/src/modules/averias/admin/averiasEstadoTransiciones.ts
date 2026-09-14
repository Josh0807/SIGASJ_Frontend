import type { EstadoAveria } from './estadoAveria'
import { isEstadoAveria } from './estadoAveria'

/** Espejo de `averias.estado-transiciones.ts` (Backend PBI 2.3). */
export const TRANSICIONES_ESTADO_AVERIA: Record<
  EstadoAveria,
  readonly EstadoAveria[]
> = {
  RECIBIDA: ['EN_REVISION'],
  EN_REVISION: ['ASIGNADA', 'PENDIENTE', 'CANCELADA'],
  ASIGNADA: ['EN_ATENCION', 'PENDIENTE', 'CANCELADA'],
  EN_ATENCION: ['RESUELTA', 'PENDIENTE'],
  PENDIENTE: ['EN_REVISION', 'ASIGNADA', 'EN_ATENCION', 'CANCELADA'],
  RESUELTA: [],
  CANCELADA: [],
}

export const ESTADOS_FINALES_AVERIA: readonly EstadoAveria[] = [
  'RESUELTA',
  'CANCELADA',
]

export function esTransicionEstadoAveriaValida(
  desde: string,
  hacia: string,
): boolean {
  if (desde === hacia) {
    return true
  }
  if (!isEstadoAveria(desde) || !isEstadoAveria(hacia)) {
    return false
  }
  return (TRANSICIONES_ESTADO_AVERIA[desde] ?? []).includes(hacia)
}

export function getEstadosDestinoPermitidos(
  estadoActual: string,
): EstadoAveria[] {
  if (!isEstadoAveria(estadoActual)) {
    return []
  }
  return [...TRANSICIONES_ESTADO_AVERIA[estadoActual]]
}

const ESTADOS_REQUIEREN_FONTANERO: readonly EstadoAveria[] = [
  'ASIGNADA',
  'EN_ATENCION',
]

export function buildOpcionesEstadoEditable(
  estadoActual: string,
  tieneFontanero = false,
): EstadoAveria[] {
  if (!isEstadoAveria(estadoActual)) {
    return []
  }
  const destinos = getEstadosDestinoPermitidos(estadoActual).filter((item) => {
    if (!tieneFontanero && ESTADOS_REQUIEREN_FONTANERO.includes(item)) {
      return false
    }
    return true
  })
  return [estadoActual, ...destinos.filter((item) => item !== estadoActual)]
}

export function requiereConfirmacionCambioEstado(
  destino: EstadoAveria,
): boolean {
  return destino === 'RESUELTA' || destino === 'CANCELADA'
}
