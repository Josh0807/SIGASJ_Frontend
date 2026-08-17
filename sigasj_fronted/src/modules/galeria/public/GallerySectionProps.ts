export type GalleryPhoto = {
  id: string
  imageUrl: string
  altText: string
  title?: string
  description?: string
}

export type GalleryCardProps = Pick<
  GalleryPhoto,
  'id' | 'imageUrl' | 'altText' | 'title' | 'description'
> & {
  onExpand?: () => void
}

export type GallerySectionProps = {
  id?: string
  title?: string
  description?: string
  /** Si se pasa, la sección muestra exactamente esas fotografías (útil para pruebas). */
  photos?: GalleryPhoto[]
  emptyMessage?: string
  errorMessage?: string
}
