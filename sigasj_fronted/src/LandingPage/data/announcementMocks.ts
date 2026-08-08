import type { Announcement } from '../Props/AnnouncementsSectionProps'
import sampleImage from '../../assets/Logo Gotin sin fondo.png'

/**
 * Mocks solo para pruebas manuales de layout (textos cortos/largos, con/sin imagen).
 * No los usa la sección en runtime.
 */
export const announcementMocks: Announcement[] = [
  {
    id: 'aviso-titulo-corto',
    title: 'Asamblea',
    summary: 'Reunión ordinaria de asociados.',
    publishedAt: '2026-08-05',
    type: 'Reunión',
  },
  {
    id: 'aviso-titulo-largo',
    title:
      'Interrupción temporal del servicio de agua potable por reparación urgente en la línea principal del sector norte de San Juan',
    summary:
      'Se atiende una fuga. El restablecimiento se comunicará al finalizar los trabajos.',
    publishedAt: '2026-07-28',
    type: 'Emergencia operativa',
    urgent: true,
    moreHref: '#contacto',
    imageUrl: sampleImage,
  },
  {
    id: 'aviso-descripcion-larga',
    title: 'Mantenimiento programado en la red de distribución',
    summary:
      'Se realizará mantenimiento preventivo en sectores de San Juan durante la madrugada. Durante la intervención podrían presentarse variaciones temporales de presión o cortes breves del servicio. Recomendamos almacenar agua potable con anticipación y atender las indicaciones del personal de campo. Agradecemos la comprensión de la comunidad mientras se ejecutan estas labores necesarias para preservar la continuidad y calidad del acueducto.',
    publishedAt: '2026-08-01',
    type: 'Mantenimiento',
    fileUrl: '#',
  },
]
