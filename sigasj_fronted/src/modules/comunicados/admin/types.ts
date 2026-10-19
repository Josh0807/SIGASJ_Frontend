import { hoyEnAsada } from '../../../shared/utils/fechaAsada'
export type ComunicadoFormValues = {
  titulo: string
  descripcion: string
  contenido: string
  tipo: string
  prioridad: 'Alta' | 'Media' | 'Baja'
  estado: 'Activo' | 'Inactivo'
  esPublico: boolean
  fechaPublicacion: string
  fechaExpiracion: string
}

export const emptyComunicadoFormValues = (): ComunicadoFormValues => ({
  titulo: '',
  descripcion: '',
  contenido: '',
  tipo: 'Informativo',
  prioridad: 'Media',
  estado: 'Activo',
  esPublico: true,
  fechaPublicacion: hoyEnAsada(),
  fechaExpiracion: '',
})
