import { Link } from 'react-router-dom'
import gotinLogo from '../../assets/Logo Gotin sin fondo.png'
import type { HeroSectionProps } from '../Props/HeroSectionProps'

/** Destino público actual del reporte de averías (sección en la Landing Page). */
const REPORT_FAULTS_HREF = '#reporte-averias'

/** Destino de AnnouncementsSection en la Landing Page. */
const ANNOUNCEMENTS_HREF = '#comunicados'

const HeroSection = ({
  id = 'inicio',
  title = 'SIGASJ – Sistema de Gestión ASADA San Juan',
  description = 'Una plataforma diseñada para acercar los servicios de la ASADA San Juan a nuestra comunidad, facilitando el acceso a información, comunicados y servicios importantes.',
  imageSrc = gotinLogo,
  imageAlt = 'Gotín, mascota de la ASADA San Juan de Santa Cruz relacionada con el servicio de agua potable',
  loginLabel = 'Iniciar sesión',
  loginHref = '/login',
  reportLabel = 'Reportar una avería',
  reportHref = REPORT_FAULTS_HREF,
  announcementsLabel = 'Ver comunicados',
  announcementsHref = ANNOUNCEMENTS_HREF,
}: HeroSectionProps) => (
  <section className="hero" id={id} aria-labelledby="hero-title">
    <div className="hero__content">
      <div className="hero__copy">
        <p className="hero__eyebrow">ASADA San Juan de Santa Cruz</p>
        <h1 id="hero-title">{title}</h1>
        <p className="hero__description">{description}</p>

        <nav className="hero__actions" aria-label="Acciones principales">
          <Link className="hero__button hero__button--primary" to={loginHref}>
            {loginLabel}
          </Link>
          <a className="hero__button hero__button--secondary" href={reportHref}>
            {reportLabel}
          </a>
          <a className="hero__button hero__button--secondary" href={announcementsHref}>
            {announcementsLabel}
          </a>
        </nav>
      </div>

      <div className="hero__visual">
        <img
          className="hero__image"
          src={imageSrc}
          alt={imageAlt}
          width={300}
          height={300}
          decoding="async"
        />
      </div>
    </div>
  </section>
)

export default HeroSection
