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
