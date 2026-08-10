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
>

export type GallerySectionProps = {
  id?: string
  title?: string
  description?: string
  photos?: GalleryPhoto[]
  emptyMessage?: string
}
