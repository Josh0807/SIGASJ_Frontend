import { useEffect, useState } from 'react'
import { getPublicAnnouncements } from '../../api/announcements/getPublicAnnouncements'
import type { Announcement } from '../Props/AnnouncementsSectionProps'

export type PublicAnnouncementsQueryStatus = 'loading' | 'success' | 'error'

type UsePublicAnnouncementsResult = {
  status: PublicAnnouncementsQueryStatus
  announcements: Announcement[]
  /** true solo si el Back-end indica explícitamente que hay más registros. */
  hasMore: boolean
  retry: () => void
}

/**
 * Consulta comunicados públicos. Los errores no se propagan: quedan en status "error".
 */
export function usePublicAnnouncements(enabled: boolean): UsePublicAnnouncementsResult {
  const [status, setStatus] = useState<PublicAnnouncementsQueryStatus>(
    enabled ? 'loading' : 'success',
  )
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const controller = new AbortController()
    let cancelled = false

    getPublicAnnouncements({ signal: controller.signal })
      .then((result) => {
        if (cancelled) {
          return
        }

        setAnnouncements(result.announcements)
        setHasMore(result.pagination.hasMore)
        setStatus('success')
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setAnnouncements([])
        setHasMore(false)
        setStatus('error')
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [enabled, retryCount])

  return {
    status,
    announcements,
    hasMore,
    retry: () => setRetryCount((count) => count + 1),
  }
}
