import type { GalleryPhoto } from '../Props/GallerySectionProps'
import sampleImage from '../../assets/ASADA LOGO.jpeg'

/**
 * Colección temporal de desarrollo para probar GallerySection.
 * Sustituir por datos del API en la tarea de integración correspondiente.
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
