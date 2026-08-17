import sampleImage from '../../../assets/ASADA LOGO.jpeg'
import type { AdminGalleryPhoto } from './types'

export const adminGalleryMocks: AdminGalleryPhoto[] = [
  {
    id: 1,
    titulo: 'Tanque de almacenamiento',
    descripcion: 'Infraestructura principal del acueducto comunal.',
    imagenUrl: sampleImage,
    textoAlternativo: 'Tanque elevado de la ASADA San Juan',
    ordenVisualizacion: 0,
    activo: true,
  },
  {
    id: 2,
    titulo: 'Trabajo comunitario',
    descripcion: 'Voluntarios apoyando labores de mantenimiento.',
    imagenUrl: sampleImage,
    textoAlternativo: 'Personal comunitario realizando mantenimiento',
    ordenVisualizacion: 1,
    activo: true,
  },
  {
    id: 3,
    titulo: null,
    descripcion: null,
    imagenUrl: sampleImage,
    textoAlternativo: 'Instalaciones de la ASADA San Juan de Santa Cruz',
    ordenVisualizacion: 2,
    activo: false,
  },
]
