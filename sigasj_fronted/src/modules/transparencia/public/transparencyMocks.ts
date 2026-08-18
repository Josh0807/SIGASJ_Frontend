import type { TransparencyPublication } from './TransparencySectionProps'
import sampleImage from '../../../assets/ASADA LOGO.jpeg'

/**
 * Colección de ejemplo para la sección pública de transparencia.
 */
export const transparencyMocks: TransparencyPublication[] = [
  {
    id: 'informe-calidad',
    name: 'Informe de calidad del agua',
    description: 'Resultados del último muestreo en la red de distribución.',
    fileUrl: sampleImage,
    fileType: 'jpg',
  },
  {
    id: 'acta-asamblea',
    name: 'Acta de asamblea',
    description: 'Resumen de acuerdos de la última asamblea de asociados.',
    fileUrl: sampleImage,
    fileType: 'jpg',
  },
]
