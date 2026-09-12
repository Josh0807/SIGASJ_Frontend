import { AVERIAS_ADMIN_PATH } from './averiasAdminPaths'
import { DEFAULT_AVERIAS_PAGE, EMPTY_FILTER } from './types'

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export type AveriasAdminListSearch = {
  page: number
  search: string
  estado: string
  prioridad: string
  tipo: string
  fechaDesde: string
  fechaHasta: string
}

export type AveriasAdminLocationState = {
  listSearch?: string
}

const toIsoDate = (value: string | null): string => {
  const trimmed = value?.trim() ?? EMPTY_FILTER
  return ISO_DATE_ONLY.test(trimmed) ? trimmed : EMPTY_FILTER
}

export function parseAveriasAdminListSearch(
  search: string,
): AveriasAdminListSearch {
  const raw = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(raw)
  const pageValue = params.get('page')
  const page =
    pageValue && /^\d+$/.test(pageValue) ? Number(pageValue) : DEFAULT_AVERIAS_PAGE

  return {
    page: page > 0 ? page : DEFAULT_AVERIAS_PAGE,
    search: params.get('search')?.trim() ?? EMPTY_FILTER,
    estado: params.get('estado')?.trim() ?? EMPTY_FILTER,
    prioridad: params.get('prioridad')?.trim() ?? EMPTY_FILTER,
    tipo: params.get('tipo')?.trim() ?? EMPTY_FILTER,
    fechaDesde: toIsoDate(params.get('fechaDesde')),
    fechaHasta: toIsoDate(params.get('fechaHasta')),
  }
}

export function buildAveriasAdminListSearch(
  query: AveriasAdminListSearch,
): string {
  const params = new URLSearchParams()

  if (query.page > DEFAULT_AVERIAS_PAGE) {
    params.set('page', String(query.page))
  }

  const search = query.search.trim()
  if (search) {
    params.set('search', search)
  }

  if (query.estado) {
    params.set('estado', query.estado)
  }

  if (query.prioridad) {
    params.set('prioridad', query.prioridad)
  }

  const tipo = query.tipo.trim()
  if (tipo) {
    params.set('tipo', tipo)
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

export function averiasAdminListPathFromState(state: unknown): string {
  if (!state || typeof state !== 'object' || !('listSearch' in state)) {
    return AVERIAS_ADMIN_PATH
  }

  const listSearch = (state as AveriasAdminLocationState).listSearch
  if (typeof listSearch !== 'string' || !listSearch.trim()) {
    return AVERIAS_ADMIN_PATH
  }

  return `${AVERIAS_ADMIN_PATH}${
    listSearch.startsWith('?') ? listSearch : `?${listSearch}`
  }`
}

export function toBackendPrioridad(prioridad: string): string | undefined {
  const trimmed = prioridad.trim()
  return trimmed ? trimmed : undefined
}
