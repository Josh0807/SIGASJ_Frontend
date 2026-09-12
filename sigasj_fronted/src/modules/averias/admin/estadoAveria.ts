/**
 * Contrato de estado persistido de Averia (Backend `EstadoAveria`).
 * Hoy solo existe RECIBIDA. El mapa de presentación es extensible:
 * agregar un valor aquí basta para filtro y badge, sin tocar cada fila.
 */
export const ESTADOS_AVERIA = ['RECIBIDA'] as const

export const EstadoAveria = {
  RECIBIDA: 'RECIBIDA',
} as const

export type EstadoAveria = (typeof ESTADOS_AVERIA)[number]

export const ESTADO_AVERIA_LABELS: Record<EstadoAveria, string> = {
  RECIBIDA: 'Recibida',
}

export const ESTADO_AVERIA_BADGE_MODIFIER: Record<EstadoAveria, string> = {
  RECIBIDA: 'is-recibida',
}

export const ESTADO_AVERIA_OPTIONS = ESTADOS_AVERIA.map((value) => ({
  value,
  label: ESTADO_AVERIA_LABELS[value],
}))

export const isEstadoAveria = (value: string): value is EstadoAveria =>
  ESTADOS_AVERIA.includes(value as EstadoAveria)

/**
 * Presentación visual de estados conocidos o previstos.
 * El filtro oficial sigue usando solo `ESTADOS_AVERIA` (hoy RECIBIDA).
 */
export const ESTADO_AVERIA_PRESENTATION: Record<
  string,
  { label: string; modifier: string }
> = {
  RECIBIDA: { label: 'Recibida', modifier: 'is-recibida' },
  ASIGNADA: { label: 'Asignada', modifier: 'is-asignada' },
  PENDIENTE_ATENCION: {
    label: 'Pendiente de atención',
    modifier: 'is-pendiente',
  },
  EN_ATENCION: { label: 'En atención', modifier: 'is-en-atencion' },
  RESUELTA: { label: 'Resuelta', modifier: 'is-resuelta' },
}

export const getEstadoAveriaPresentation = (estado: string) => {
  const known = ESTADO_AVERIA_PRESENTATION[estado]
  if (known) {
    return {
      value: estado,
      label: known.label,
      modifier: known.modifier,
    }
  }

  if (isEstadoAveria(estado)) {
    return {
      value: estado,
      label: ESTADO_AVERIA_LABELS[estado],
      modifier: ESTADO_AVERIA_BADGE_MODIFIER[estado],
    }
  }

  return {
    value: estado,
    label: estado,
    modifier: 'is-desconocido',
  }
}
