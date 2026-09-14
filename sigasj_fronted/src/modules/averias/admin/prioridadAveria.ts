/** Contrato Backend `PrioridadAveria` (PBI 2.3). */
export const PRIORIDADES_AVERIA = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'] as const

export type PrioridadAveria = (typeof PRIORIDADES_AVERIA)[number]

export const PRIORIDAD_AVERIA_LABELS: Record<PrioridadAveria, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
}

export const PRIORIDAD_AVERIA_OPTIONS = PRIORIDADES_AVERIA.map((value) => ({
  value,
  label: PRIORIDAD_AVERIA_LABELS[value],
}))

export const isPrioridadAveria = (value: string): value is PrioridadAveria =>
  PRIORIDADES_AVERIA.includes(value as PrioridadAveria)
