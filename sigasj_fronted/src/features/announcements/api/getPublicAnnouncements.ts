import { getPublicAnnouncementsPath } from '../../../shared/api/config'
import { fetchJson } from '../../../shared/api/http'
import {
  extractPublicAnnouncementsPagination,
  extractPublicAnnouncementsPayload,
  mapPublicAnnouncement,
  type PublicAnnouncementsPagination,
  type PublicAnnouncementsResponse,
} from './types'
import type { Announcement } from '../types'
import { ApiError } from '../../../shared/api/ApiError'

type GetPublicAnnouncementsOptions = {
  signal?: AbortSignal
}

export type PublicAnnouncementsResult = {
  announcements: Announcement[]
  pagination: PublicAnnouncementsPagination
}

/**
 * Consulta los comunicados públicos del Back-end.
 * - Éxito con datos: retorna announcements + paginación real (si existe)
 * - Éxito sin datos: announcements []
 * - Sin metadatos de paginación: hasMore = false (no se inventa)
 * - Fallo de red/HTTP/config: lanza ApiError
 */
export async function getPublicAnnouncements(
  options: GetPublicAnnouncementsOptions = {},
): Promise<PublicAnnouncementsResult> {
  const payload = await fetchJson<PublicAnnouncementsResponse>(
    getPublicAnnouncementsPath(),
    { signal: options.signal },
  )

  if (payload === null || typeof payload !== 'object') {
    throw new ApiError(
      'La respuesta del servidor no contiene una colección de comunicados.',
      'PARSE',
    )
  }

  const rawItems = extractPublicAnnouncementsPayload(payload)
  const pagination = extractPublicAnnouncementsPagination(payload)

  const announcements = rawItems.flatMap((item) => {
    try {
      const mapped = mapPublicAnnouncement(item)
      return mapped ? [mapped] : []
    } catch {
      // Un ítem malformado no debe tumbar la sección ni el resto de la lista.
      return []
    }
  })

  return { announcements, pagination }
}
