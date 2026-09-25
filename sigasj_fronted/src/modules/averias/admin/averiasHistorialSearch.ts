import { DEFAULT_AVERIAS_PAGE, EMPTY_FILTER } from './types'

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export type AveriasHistorialSearch = {
  page: number
  codigoSeguimiento: string
  estado: string
  prioridad: string
  tipo: string
  fontaneroId: string
  sector: string
  fechaDesde: string
  fechaHasta: string
}

const toIsoDate = (value: string | null): string => {
  const trimmed = value?.trim() ?? EMPTY_FILTER
  return ISO_DATE_ONLY.test(trimmed) ? trimmed : EMPTY_FILTER
}

const toFontaneroId = (value: string | null): string => {
  const trimmed = value?.trim() ?? EMPTY_FILTER
  if (!/^\d+$/.test(trimmed)) {
    return EMPTY_FILTER
  }
  return Number(trimmed) > 0 ? trimmed : EMPTY_FILTER
}

export function parseAveriasHistorialSearch(search: string): AveriasHistorialSearch {
  const raw = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(raw)
  const pageValue = params.get('page')
  const page =
    pageValue && /^\d+$/.test(pageValue) ? Number(pageValue) : DEFAULT_AVERIAS_PAGE

  return {
    page: page > 0 ? page : DEFAULT_AVERIAS_PAGE,
    codigoSeguimiento: params.get('codigoSeguimiento')?.trim() ?? EMPTY_FILTER,
    estado: params.get('estado')?.trim() ?? EMPTY_FILTER,
    prioridad: params.get('prioridad')?.trim() ?? EMPTY_FILTER,
    tipo: params.get('tipo')?.trim() ?? EMPTY_FILTER,
    fontaneroId: toFontaneroId(params.get('fontaneroId')),
    sector: params.get('sector')?.trim() ?? EMPTY_FILTER,
    fechaDesde: toIsoDate(params.get('fechaDesde')),
    fechaHasta: toIsoDate(params.get('fechaHasta')),
  }
}

export function buildAveriasHistorialSearch(query: AveriasHistorialSearch): string {
  const params = new URLSearchParams()

  if (query.page > DEFAULT_AVERIAS_PAGE) {
    params.set('page', String(query.page))
  }

  const codigo = query.codigoSeguimiento.trim()
  if (codigo) {
    params.set('codigoSeguimiento', codigo)
  }

  if (query.estado) {
    params.set('estado', query.estado)
  }

  if (query.prioridad) {
    params.set('prioridad', query.prioridad)
  }

  if (query.tipo) {
    params.set('tipo', query.tipo)
  }

  if (query.fontaneroId) {
    params.set('fontaneroId', query.fontaneroId)
  }

  const sector = query.sector.trim()
  if (sector) {
    params.set('sector', sector)
  }

  if (toIsoDate(query.fechaDesde)) {
    params.set('fechaDesde', query.fechaDesde)
  }

  if (toIsoDate(query.fechaHasta)) {
    params.set('fechaHasta', query.fechaHasta)
  }

  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export function historialRangoFechasInvalido(
  fechaDesde: string,
  fechaHasta: string,
): boolean {
  return Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta)
}
