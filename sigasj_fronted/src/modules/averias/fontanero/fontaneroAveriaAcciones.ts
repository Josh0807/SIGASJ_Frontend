import { TRANSICIONES_ESTADO_AVERIA } from '../admin/averiasEstadoTransiciones'
import { isEstadoAveria, type EstadoAveria } from '../admin/estadoAveria'

/**
 * El Fontanero solo puede cerrar una avería en atención.
 * Otras transiciones de estado siguen siendo administrativas.
 */
export const FONTANERO_PUEDE_MUTAR_AVERIA = true

const ACCIONES_PREVISTAS_BACKLOG: Partial<
  Record<EstadoAveria, readonly EstadoAveria[]>
> = {
  EN_ATENCION: ['RESUELTA'],
  RESUELTA: [],
}

export function puedeMarcarAveriaResuelta(estadoActual: string): boolean {
  return estadoActual === 'EN_ATENCION'
}

export function puedeIntentarIniciarAtencionAveria(estadoActual: string): boolean {
  return (
    estadoActual === 'ASIGNADA' ||
    estadoActual === 'PENDIENTE' ||
    estadoActual === 'PENDIENTE_ATENCION'
  )
}

/** El Fontanero documenta la atención mientras el caso no esté resuelto. */
export function puedeRegistrarObservacionAveria(estadoActual: string): boolean {
  return estadoActual !== 'RESUELTA'
}

export function getFontaneroAccionesOperativas(
  estadoActual: string,
): EstadoAveria[] {
  if (!FONTANERO_PUEDE_MUTAR_AVERIA) {
    return []
  }

  if (!isEstadoAveria(estadoActual)) {
    return []
  }

  const previstas = ACCIONES_PREVISTAS_BACKLOG[estadoActual] ?? []
  const permitidas = TRANSICIONES_ESTADO_AVERIA[estadoActual] ?? []
  return previstas.filter((destino) => permitidas.includes(destino))
}
