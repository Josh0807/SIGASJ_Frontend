import AnnouncementCard from './AnnouncementCard'
import type {
  Announcement,
  AnnouncementsSectionProps,
} from '../Props/AnnouncementsSectionProps'
import { ANNOUNCEMENTS_SECTION_ID } from '../config/landingAnchors'

/** Datos temporales de desarrollo: cubren texto corto, largo y un caso urgente. */
const defaultAnnouncements: Announcement[] = [
  {
    id: 'aviso-reunion-asamblea',
    title: 'Convocatoria a asamblea',
    summary: 'Se convoca a la asamblea ordinaria de asociados.',
    publishedAt: '2026-08-05',
    type: 'Reunión',
  },
  {
    id: 'aviso-corte-emergencia',
    title: 'Interrupción temporal del servicio por reparación urgente',
    summary:
      'Se atiende una fuga en la línea principal. El restablecimiento se comunicará tan pronto finalicen los trabajos de reparación.',
    publishedAt: '2026-07-28',
    type: 'Emergencia',
    urgent: true,
    moreHref: '#contacto',
    moreLabel: 'Ver más',
  },
  {
    id: 'aviso-mantenimiento-red',
    title: 'Mantenimiento programado en la red de distribución',
    summary:
      'Se realizará mantenimiento preventivo en sectores de San Juan durante la madrugada. Durante la intervención podrían presentarse variaciones temporales de presión o cortes breves del servicio. Recomendamos almacenar agua potable con anticipación y atender las indicaciones del personal de campo. Agradecemos la comprensión de la comunidad mientras se ejecutan estas labores necesarias para preservar la continuidad y calidad del acueducto.',
    publishedAt: '2026-08-01',
    type: 'Mantenimiento',
  },
]

const AnnouncementsSection = ({
  id = ANNOUNCEMENTS_SECTION_ID,
  title = 'Comunicados',
  description = 'Mantente informado sobre avisos importantes, mantenimientos, cortes de agua y otras comunicaciones de la ASADA San Juan.',
  announcements = defaultAnnouncements,
  emptyMessage = 'Por el momento no hay comunicados publicados.',
}: AnnouncementsSectionProps) => {
  const hasAnnouncements = announcements.length > 0

  return (
    <section
      className="landing-section announcements-section"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="announcements-section__content">
        <header className="announcements-section__heading">
          <p className="announcements-section__eyebrow">Información oficial</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{description}</p>
        </header>

        {hasAnnouncements ? (
          <div className="announcements-section__grid">
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement.id} {...announcement} />
            ))}
          </div>
        ) : (
          <p className="announcements-section__empty" role="status">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  )
}

export default AnnouncementsSection
