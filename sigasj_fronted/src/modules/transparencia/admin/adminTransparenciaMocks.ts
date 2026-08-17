import sampleImage from '../../../assets/ASADA LOGO.jpeg'
import type { AdminTransparenciaPublication } from './types'

export const adminTransparenciaMocks: AdminTransparenciaPublication[] = [
  {
    id: 1,
    nombre: 'Informe de calidad del agua',
    descripcionBreve: 'Resultados del último muestreo en la red de distribución.',
    archivoUrl: sampleImage,
    tipoArchivo: 'jpg',
    ordenVisualizacion: 0,
    activo: true,
  },
  {
    id: 2,
    nombre: 'Acta de asamblea',
    descripcionBreve: 'Resumen de acuerdos de la última asamblea de asociados.',
    archivoUrl: sampleImage,
    tipoArchivo: 'pdf',
    ordenVisualizacion: 1,
    activo: true,
  },
]
