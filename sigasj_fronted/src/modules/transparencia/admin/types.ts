import type { TransparencyFileType } from '../types/types'

export type AdminTransparenciaPublication = {
  id: number
  nombre: string
  descripcionBreve: string
  archivoUrl: string
  tipoArchivo: TransparencyFileType
  ordenVisualizacion: number
  activo: boolean
}

export type AdminTransparenciaFilters = {
  nombre?: string
  activo?: boolean
}

export type TransparenciaFormValues = {
  nombre: string
  descripcionBreve: string
  ordenVisualizacion: number
  activo: boolean
}

export const emptyTransparenciaFormValues = (): TransparenciaFormValues => ({
  nombre: '',
  descripcionBreve: '',
  ordenVisualizacion: 0,
  activo: true,
})

export const isTransparenciaImageType = (
  fileType: TransparencyFileType,
): boolean => fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png'
