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
  /** Si se pasa, la sección no consulta al API (útil para pruebas). */
  photos?: GalleryPhoto[]
  emptyMessage?: string
  errorMessage?: string
}

export type AdminGalleryPhoto = {
  id: number
  titulo: string | null
  descripcion: string | null
  imagenUrl: string
  textoAlternativo: string
  ordenVisualizacion: number
  activo: boolean
}

export type AdminGalleryFilters = {
  titulo?: string
  activo?: boolean
}

export type GalleryFormValues = {
  titulo: string
  descripcion: string
  textoAlternativo: string
  ordenVisualizacion: number
  activo: boolean
}

export const emptyGalleryFormValues = (): GalleryFormValues => ({
  titulo: '',
  descripcion: '',
  textoAlternativo: '',
  ordenVisualizacion: 0,
  activo: true,
})
