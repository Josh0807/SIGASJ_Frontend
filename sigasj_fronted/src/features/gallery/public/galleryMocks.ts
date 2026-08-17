import type { GalleryPhoto } from './GallerySectionProps'
import sampleImage from '../../../assets/ASADA LOGO.jpeg'

/**
 * Colección de ejemplo para probar GallerySection.
 */
export const galleryMocks: GalleryPhoto[] = [
  {
    id: '1',
    title: 'Tanque de almacenamiento',
    description: 'Infraestructura principal del acueducto comunal.',
    imageUrl: sampleImage,
    altText: 'Tanque elevado de la ASADA San Juan',
  },
  {
    id: '2',
    title: 'Trabajo comunitario',
    description: 'Voluntarios apoyando labores de mantenimiento.',
    imageUrl: sampleImage,
    altText: 'Personal comunitario realizando mantenimiento',
  },
  {
    id: '3',
    imageUrl: sampleImage,
    altText: 'Instalaciones de la ASADA San Juan de Santa Cruz',
  },
]
