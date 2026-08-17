import type { Announcement } from './AnnouncementsSectionProps'
import sampleImage from '../../../assets/Logo Gotin sin fondo.png'

/**
 * Colección de ejemplo para probar AnnouncementCard en la sección.
 */
export const announcementMocks: Announcement[] = [
  {
    id: 'aviso-asamblea',
    title: 'Asamblea',
    summary: 'Reunión ordinaria de asociados.',
    publishedAt: '2026-08-05',
    type: 'Reunión',
  },
  {
    id: 'aviso-corte-urgente',
    title:
      'Interrupción temporal del servicio de agua potable por reparación urgente en la línea principal del sector norte de San Juan',
    summary:
      'Se atiende una fuga. El restablecimiento se comunicará al finalizar los trabajos.',
    content:
      'Detalle operativo completo del corte: sectores afectados, horarios estimados y recomendaciones a la comunidad mientras dura la intervención.',
    publishedAt: '2026-07-28',
    type: 'Emergencia',
    urgent: true,
    moreHref: '#contacto',
    moreLabel: 'Ver más',
    imageUrl: sampleImage,
  },
  {
    id: 'aviso-mantenimiento',
    title: 'Mantenimiento programado en la red de distribución',
    summary:
      'Se realizará mantenimiento preventivo en sectores de San Juan durante la madrugada. Durante la intervención podrían presentarse variaciones temporales de presión o cortes breves del servicio. Recomendamos almacenar agua potable con anticipación y atender las indicaciones del personal de campo. Agradecemos la comprensión de la comunidad mientras se ejecutan estas labores necesarias para preservar la continuidad y calidad del acueducto.',
    publishedAt: '2026-08-01',
    type: 'Mantenimiento',
  },
  {
    id: 'aviso-sin-imagen',
    title: 'Aviso de calidad del agua',
    summary: 'Resultados de muestreo dentro de los parámetros establecidos.',
    publishedAt: '2026-08-03',
    type: 'Aviso',
  },
  {
    id: 'aviso-opcionales-ausentes',
    title: 'Comunicado con campos opcionales ausentes',
    summary: 'Solo título y descripción; sin tipo, fecha, imagen ni Ver más.',
  },
]
