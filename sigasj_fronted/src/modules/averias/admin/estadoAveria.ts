/**
 * Contrato de estado persistido de Averia (Backend `EstadoAveria`, PBI 2.3).
 */
export const ESTADOS_AVERIA = [
  'RECIBIDA',
  'EN_REVISION',
  'ASIGNADA',
  'EN_ATENCION',
  'PENDIENTE',
  'RESUELTA',
  'CANCELADA',
] as const

export const EstadoAveria = {
  RECIBIDA: 'RECIBIDA',
  EN_REVISION: 'EN_REVISION',
  ASIGNADA: 'ASIGNADA',
  EN_ATENCION: 'EN_ATENCION',
  PENDIENTE: 'PENDIENTE',
  RESUELTA: 'RESUELTA',
  CANCELADA: 'CANCELADA',
} as const

export type EstadoAveria = (typeof ESTADOS_AVERIA)[number]

export const ESTADO_AVERIA_LABELS: Record<EstadoAveria, string> = {
  RECIBIDA: 'Recibida',
  EN_REVISION: 'En revisión',
  ASIGNADA: 'Asignada',
  EN_ATENCION: 'En atención',
  PENDIENTE: 'Pendiente',
  RESUELTA: 'Resuelta',
  CANCELADA: 'Cancelada',
}

export const ESTADO_AVERIA_BADGE_MODIFIER: Record<EstadoAveria, string> = {
  RECIBIDA: 'is-recibida',
  EN_REVISION: 'is-en-revision',
  ASIGNADA: 'is-asignada',
  EN_ATENCION: 'is-en-atencion',
  PENDIENTE: 'is-pendiente',
  RESUELTA: 'is-resuelta',
  CANCELADA: 'is-cancelada',
}

export const ESTADO_AVERIA_OPTIONS = ESTADOS_AVERIA.map((value) => ({
  value,
  label: ESTADO_AVERIA_LABELS[value],
}))

export const isEstadoAveria = (value: string): value is EstadoAveria =>
  ESTADOS_AVERIA.includes(value as EstadoAveria)

/**
 * Presentación visual de estados conocidos (incluye alias legacy en fixtures).
 */
export const ESTADO_AVERIA_PRESENTATION: Record<
  string,
  { label: string; modifier: string }
> = {
  RECIBIDA: { label: 'Recibida', modifier: 'is-recibida' },
  EN_REVISION: { label: 'En revisión', modifier: 'is-en-revision' },
  ASIGNADA: { label: 'Asignada', modifier: 'is-asignada' },
  PENDIENTE: { label: 'Pendiente', modifier: 'is-pendiente' },
  PENDIENTE_ATENCION: {
    label: 'Pendiente de atención',
    modifier: 'is-pendiente',
  },
  EN_ATENCION: { label: 'En atención', modifier: 'is-en-atencion' },
  RESUELTA: { label: 'Resuelta', modifier: 'is-resuelta' },
  CANCELADA: { label: 'Cancelada', modifier: 'is-cancelada' },
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
