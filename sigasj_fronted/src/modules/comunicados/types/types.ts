export type AnnouncementPrioridad = 'Alta' | 'Media' | 'Baja'

export type Announcement = {
  id: string
  title: string
  summary?: string
  content?: string
  publishedAt?: string
  type?: string
  prioridad?: AnnouncementPrioridad | string
  urgent?: boolean
  moreHref?: string
  moreLabel?: string
  imageUrl?: string
  fileUrl?: string
}
