export type Announcement = {
  id: string
  title: string
  summary: string
  publishedAt: string
  type?: string
  urgent?: boolean
  moreHref?: string
  moreLabel?: string
}

export type AnnouncementCardProps = {
  id: string
  title: string
  summary: string
  publishedAt: string
  type?: string
  urgent?: boolean
  moreHref?: string
  moreLabel?: string
}

export type AnnouncementsSectionProps = {
  id?: string
  title?: string
  description?: string
  announcements?: Announcement[]
  emptyMessage?: string
}
