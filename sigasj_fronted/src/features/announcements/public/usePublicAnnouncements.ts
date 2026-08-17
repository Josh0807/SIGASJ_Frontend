import type { Announcement } from './AnnouncementsSectionProps'
import { announcementMocks } from './announcementMocks'

export type PublicAnnouncementsQueryStatus = 'loading' | 'success' | 'error'

type UsePublicAnnouncementsResult = {
  status: PublicAnnouncementsQueryStatus
  announcements: Announcement[]
  hasMore: boolean
  retry: () => void
}

/**
 * Entrega comunicados de ejemplo para la sección pública.
 */
export function usePublicAnnouncements(enabled: boolean): UsePublicAnnouncementsResult {
  return {
    status: 'success',
    announcements: enabled ? announcementMocks : [],
    hasMore: false,
    retry: () => {},
  }
}
