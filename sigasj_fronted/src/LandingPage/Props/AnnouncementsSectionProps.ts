export type Announcement = {
  id: string
  title: string
  /** Descripción breve pública. */
  summary?: string
  /** Contenido completo público (opcional). */
  content?: string
  publishedAt?: string
  type?: string
  urgent?: boolean
  moreHref?: string
  moreLabel?: string
  imageUrl?: string
  fileUrl?: string
}

export type AnnouncementCardProps = {
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

export type AnnouncementsSectionProps = {
  id?: string
  title?: string
  description?: string
  /** Si se pasa, la sección no consulta al API (útil para pruebas). */
  announcements?: Announcement[]
  emptyMessage?: string
  errorMessage?: string
  /**
   * Ruta SPA pública para ver más comunicados (Opción A).
   * Si es null/undefined, se usa PUBLIC_ANNOUNCEMENTS_MORE_HREF del config.
   * Sin ruta definida, el CTA no se muestra.
   */
  moreAnnouncementsHref?: string | null
  /**
   * Indica si hay más registros (solo con metadatos reales del API o override de prueba).
   * En modo controlado, si no se pasa, el CTA no asume que hay más.
   */
  hasMoreAnnouncements?: boolean
  moreAnnouncementsLabel?: string
}
