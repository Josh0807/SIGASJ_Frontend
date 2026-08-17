export type Announcement = {
  id: string
  title: string
  summary?: string
  content?: string
  publishedAt?: string
  type?: string
  urgent?: boolean
  moreHref?: string
  moreLabel?: string
  imageUrl?: string
  fileUrl?: string
}
