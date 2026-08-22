import { useCallback, useEffect, useState } from 'react'
import type { Announcement } from '../types/AnnouncementsSectionProps'
import { getPublicComunicados } from '../services/comunicadosApi'

export type PublicAnnouncementsQueryStatus = 'loading' | 'success' | 'error'

type UsePublicAnnouncementsResult = {
  status: PublicAnnouncementsQueryStatus
  announcements: Announcement[]
  hasMore: boolean
  retry: () => void
}

export function usePublicAnnouncements(
  enabled: boolean,
): UsePublicAnnouncementsResult {
  const [status, setStatus] = useState<PublicAnnouncementsQueryStatus>(
    enabled ? 'loading' : 'success',
  )
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  const load = useCallback(async () => {
    if (!enabled) {
      setStatus('success')
      setAnnouncements([])
      return
    }

    setStatus('loading')

    try {
      const data = await getPublicComunicados()
      setAnnouncements(data)
      setStatus('success')
    } catch {
      setAnnouncements([])
      setStatus('error')
    }
  }, [enabled])

  useEffect(() => {
    void load()
  }, [load])

  return {
    status,
    announcements,
    hasMore: false,
    retry: () => {
      void load()
    },
  }
}
