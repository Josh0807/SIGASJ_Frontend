import type { Announcement } from '../types/AnnouncementsSectionProps'
import sampleImage from '../../../assets/Logo Gotin sin fondo.png'

/**
 * Colección de ejemplo para probar AnnouncementCard en la sección.
 */
export const announcementMocks: Announcement[] = [
  {
    id: 'informe-calidad',
    title: 'Informe de calidad del agua',
    summary: 'Resultados del último muestreo en la red de distribución.',
    publishedAt: '2026-08-05',
    type: 'Aviso',
    imageUrl: sampleImage,
  },
  {
    id: 'acta-asamblea',
    title: 'Acta de asamblea',
    summary: 'Resumen de acuerdos de la última asamblea de asociados.',
    publishedAt: '2026-08-03',
    type: 'Reunión',
    imageUrl: sampleImage,
  },
  {
    id: 'aviso-corte-urgente',
    title: 'Interrupción temporal del servicio en sector norte',
    summary:
      'Se atiende una fuga en la línea principal. El restablecimiento se comunicará al finalizar los trabajos.',
    publishedAt: '2026-07-28',
    type: 'Emergencia',
    urgent: true,
    moreHref: '#contacto',
    moreLabel: 'Consultar detalle',
  },
  {
    id: 'aviso-mantenimiento',
    title: 'Mantenimiento programado en la red de distribución',
    summary:
      'Labores preventivas durante la madrugada con posibles variaciones temporales de presión.',
    publishedAt: '2026-08-01',
    type: 'Mantenimiento',
  },
  {
    id: 'reglamento-servicio',
    title: 'Actualización del reglamento de prestación de servicios',
    summary: 'Documento disponible para consulta de abonados y usuarios.',
    publishedAt: '2026-07-20',
    type: 'Informativo',
    fileUrl: '/docs/reglamento.pdf',
  },
]
