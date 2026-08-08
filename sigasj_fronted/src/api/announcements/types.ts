import type { Announcement } from '../../LandingPage/Props/AnnouncementsSectionProps'

/**
 * Campos públicos candidatos del recurso de comunicados.
 * El Back-end aún no publica el contrato definitivo; solo se leen claves
 * públicas conocidas. Nunca se inventan valores ni se mapean datos de autoría.
 */
export type PublicAnnouncementDto = Record<string, unknown>

export type PublicAnnouncementsResponse =
  | PublicAnnouncementDto[]
  | {
      data?: PublicAnnouncementDto[]
      items?: PublicAnnouncementDto[]
      results?: PublicAnnouncementDto[]
      hasNextPage?: boolean
      nextPage?: number
      totalPages?: number
      total?: number
      page?: number
      currentPage?: number
      meta?: {
        hasNextPage?: boolean
        nextPage?: number
        totalPages?: number
        total?: number
        page?: number
        currentPage?: number
      }
    }

export type PublicAnnouncementsPagination = {
  /** Solo true cuando el Back-end lo indica de forma explícita. */
  hasMore: boolean
  nextPage?: number
  total?: number
  totalPages?: number
}

const asTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed || undefined
}

const asId = (value: unknown): string | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return asTrimmedString(value)
}

const asBoolean = (value: unknown): boolean | undefined => {
  return typeof value === 'boolean' ? value : undefined
}

const firstString = (
  record: Record<string, unknown>,
  keys: string[],
): string | undefined => {
  for (const key of keys) {
    const value = asTrimmedString(record[key])
    if (value) {
      return value
    }
  }
  return undefined
}

const firstBoolean = (
  record: Record<string, unknown>,
  keys: string[],
): boolean | undefined => {
  for (const key of keys) {
    const value = asBoolean(record[key])
    if (value !== undefined) {
      return value
    }
  }
  return undefined
}

/**
 * Convierte un ítem crudo del API en Announcement público.
 * - Sin id o título: se descarta (no se inventan placeholders).
 * - Campos opcionales ausentes/null: se omiten.
 * - Datos de creador/admin: nunca se propagan a la tarjeta.
 */
export function mapPublicAnnouncement(dto: unknown): Announcement | null {
  if (!dto || typeof dto !== 'object' || Array.isArray(dto)) {
    return null
  }

  const record = dto as Record<string, unknown>

  const id = asId(record.id)
  const title = firstString(record, ['title', 'titulo'])

  if (!id || !title) {
    return null
  }

  const summary = firstString(record, [
    'summary',
    'description',
    'descripcion',
  ])
  const content = firstString(record, ['content', 'contenido'])

  // Sin texto público útil: no renderizar tarjeta vacía.
  if (!summary && !content) {
    return null
  }

  return {
    id,
    title,
    summary,
    content,
    publishedAt: firstString(record, [
      'publishedAt',
      'fechaPublicacion',
      'fecha_publicacion',
    ]),
    type: firstString(record, ['type', 'tipo']),
    urgent: firstBoolean(record, ['urgent', 'urgente']) ?? false,
    moreHref: firstString(record, ['moreHref', 'detailUrl', 'urlDetalle']),
    imageUrl: firstString(record, ['imageUrl', 'imagenUrl', 'imagen']),
    fileUrl: firstString(record, ['fileUrl', 'archivoUrl', 'archivo']),
  }
}

export function extractPublicAnnouncementsPayload(
  payload: PublicAnnouncementsResponse,
): PublicAnnouncementDto[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload.data)) {
    return payload.data
  }

  if (Array.isArray(payload.items)) {
    return payload.items
  }

  if (Array.isArray(payload.results)) {
    return payload.results
  }

  return []
}

const asFiniteNumber = (value: unknown): number | undefined => {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

/**
 * Lee metadatos de paginación solo si el Back-end los envía.
 * Sin esas claves, hasMore queda en false (no se infiere por cantidad de ítems).
 */
export function extractPublicAnnouncementsPagination(
  payload: PublicAnnouncementsResponse,
): PublicAnnouncementsPagination {
  if (Array.isArray(payload)) {
    return { hasMore: false }
  }

  const source =
    payload.meta && typeof payload.meta === 'object' ? payload.meta : payload

  const hasNextPage = asBoolean(source.hasNextPage)
  const nextPage = asFiniteNumber(source.nextPage)
  const totalPages = asFiniteNumber(source.totalPages)
  const total = asFiniteNumber(source.total)
  const page = asFiniteNumber(source.page) ?? asFiniteNumber(source.currentPage)

  if (hasNextPage !== undefined) {
    return {
      hasMore: hasNextPage,
      nextPage: hasNextPage ? nextPage : undefined,
      total,
      totalPages,
    }
  }

  if (totalPages !== undefined && page !== undefined) {
    const hasMore = page < totalPages
    return {
      hasMore,
      nextPage: hasMore ? page + 1 : undefined,
      total,
      totalPages,
    }
  }

  return {
    hasMore: false,
    nextPage,
    total,
    totalPages,
  }
}
