import {
  AVERIA_UNASSIGNED_LABEL,
  AVERIA_UNCLASSIFIED_LABEL,
  getPrioridadLabel,
  getTipoAveriaDetailLabel,
} from '../admin/types'
import { isPrioridadAveria } from '../admin/prioridadAveria'
import { isTipoAveria } from '../admin/tipoAveria'
import {
  AVERIAS_FONTANERO_OBSERVACIONES_VACIAS,
  type AveriaObservacionItem,
} from './types'

const TIPO_PLACEHOLDERS = new Set([
  AVERIA_UNCLASSIFIED_LABEL.toLowerCase(),
  'sin clasificar',
])

const PRIORIDAD_PLACEHOLDERS = new Set([
  AVERIA_UNASSIGNED_LABEL.toLowerCase(),
  'sin asignar',
])

const OBSERVACIONES_PLACEHOLDERS = new Set([
  'sin observaciones',
  AVERIAS_FONTANERO_OBSERVACIONES_VACIAS.toLowerCase(),
])

const isPlaceholder = (
  value: string | null | undefined,
  placeholders: Set<string>,
): boolean => {
  const trimmed = value?.trim()
  if (!trimmed) {
    return true
  }
  return placeholders.has(trimmed.toLowerCase())
}

/** El Backend puede devolver el enum o el texto de ausencia. No se convierte a un enum inventado. */
export const getFontaneroTipoLabel = (tipoAveria: string | null | undefined): string => {
  if (isPlaceholder(tipoAveria, TIPO_PLACEHOLDERS)) {
    return AVERIA_UNCLASSIFIED_LABEL
  }

  const raw = tipoAveria!.trim()
  if (isTipoAveria(raw.toUpperCase())) {
    return getTipoAveriaDetailLabel(raw.toUpperCase())
  }

  return getTipoAveriaDetailLabel(raw)
}

export const getFontaneroPrioridadLabel = (
  prioridad: string | null | undefined,
): string => {
  if (isPlaceholder(prioridad, PRIORIDAD_PLACEHOLDERS)) {
    return AVERIA_UNASSIGNED_LABEL
  }

  const raw = prioridad!.trim()
  if (isPrioridadAveria(raw.toUpperCase())) {
    return getPrioridadLabel(raw.toUpperCase())
  }

  return getPrioridadLabel(raw)
}

export const getFontaneroPrioridadModifier = (
  prioridad: string | null | undefined,
): string => {
  if (isPlaceholder(prioridad, PRIORIDAD_PLACEHOLDERS)) {
    return ''
  }
  const raw = prioridad!.trim().toLowerCase()
  if (['baja', 'media', 'alta', 'urgente'].includes(raw)) {
    return `is-${raw}`
  }
  const upper = prioridad!.trim().toUpperCase()
  if (isPrioridadAveria(upper)) {
    return `is-${upper.toLowerCase()}`
  }
  return ''
}

export const getFontaneroObservacionesLabel = (
  observaciones: string | null | undefined,
): string => {
  if (isPlaceholder(observaciones, OBSERVACIONES_PLACEHOLDERS)) {
    return AVERIAS_FONTANERO_OBSERVACIONES_VACIAS
  }
  return observaciones!.trim()
}

export const sortObservacionesAtencion = (
  observaciones: AveriaObservacionItem[],
): AveriaObservacionItem[] =>
  [...observaciones].sort((left, right) => {
    const byDate =
      new Date(left.fechaCreacion).getTime() -
      new Date(right.fechaCreacion).getTime()
    if (byDate !== 0) {
      return byDate
    }
    return left.id - right.id
  })
