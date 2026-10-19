import { formatearFechaAsada } from '../../../shared/utils/fechaAsada'

const EMPTY_DATE = '—'

/**
 * Fecha de creación/actualización en Costa Rica (DD/MM/AAAA). El API entrega
 * instantes UTC: una creación de las 20:35 del 17 llega como 02:35Z del 18 y debe
 * mostrarse como 17/10.
 */
export const formatProyectoAdminDate = (value: string | null | undefined): string => {
  if (!value?.trim()) {
    return EMPTY_DATE
  }
  return formatearFechaAsada(value.trim(), EMPTY_DATE)
}
