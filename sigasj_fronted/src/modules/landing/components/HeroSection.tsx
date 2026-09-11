import heroImage from '../../../assets/Hero1.png'
import { Link } from 'react-router-dom'
import type { HeroSectionProps } from '../types/HeroSectionProps'
import { ANNOUNCEMENTS_HREF } from '../config/landingAnchors'
import { REPORTAR_AVERIA_ROUTE_PATH } from '../../../app/router/routePaths'

/** Destino público del reporte de averías. */
const REPORT_FAULTS_HREF = REPORTAR_AVERIA_ROUTE_PATH

const HeroSection = ({
  id = 'inicio',
  title = 'SIGASJ – Sistema de Gestión del Acueducto de ASADA San Juan',
  description = 'Una plataforma diseñada para acercar los servicios de la ASADA San Juan a nuestra comunidad, facilitando el acceso a información, comunicados y servicios importantes.',
  imageSrc = heroImage,
  reportLabel = 'Reportar una avería',
  reportHref = REPORT_FAULTS_HREF,
  announcementsLabel = 'Ver comunicados',
  announcementsHref = ANNOUNCEMENTS_HREF,
}: HeroSectionProps) => (
  <section
    className="hero"
    id={id}
    aria-labelledby="hero-title"
    style={{
      backgroundImage: `linear-gradient(90deg, rgba(7, 35, 65, 0.9) 0%, rgba(11, 52, 89, 0.76) 48%, rgba(7, 35, 65, 0.48) 100%), url(${imageSrc})`,
    }}
  >
    <div className="hero__content">
      <div className="hero__copy">
        <p className="hero__eyebrow">ASADA San Juan de Santa Cruz</p>
        <h1 id="hero-title">{title}</h1>
        <p className="hero__description">{description}</p>

        <nav className="hero__actions" aria-label="Acciones principales">
          <Link className="hero__button hero__button--secondary" to={reportHref}>
            {reportLabel}
          </Link>
          <a className="hero__button hero__button--secondary" href={announcementsHref}>
            {announcementsLabel}
          </a>
        </nav>
      </div>
    </div>
  </section>
)

export default HeroSection
