import gotinLogo from '../../assets/Logo Gotin sin fondo.png'
import type { HeroSectionProps } from '../Props/HeroSectionProps'

const HeroSection = ({
  id = 'inicio',
  title = 'SIGASJ – Sistema de Gestión ASADA San Juan',
  description = 'Una plataforma diseñada para acercar los servicios de la ASADA San Juan a nuestra comunidad, facilitando el acceso a información, comunicados y servicios importantes.',
  imageSrc = gotinLogo,
  imageAlt = 'Gotín, mascota de la ASADA San Juan de Santa Cruz relacionada con el servicio de agua potable',
  loginLabel = 'Iniciar sesión',
  loginHref = '/login',
  reportLabel = 'Reportar una avería',
  reportHref = '#reporte-averias',
  announcementsLabel = 'Ver comunicados',
  announcementsHref = '#comunicados',
}: HeroSectionProps) => (
  <section className="hero" id={id} aria-labelledby="hero-title">
    <div className="hero__content">
      <div className="hero__copy">
        <p className="hero__eyebrow">ASADA San Juan de Santa Cruz</p>
        <h1 id="hero-title">{title}</h1>
        <p className="hero__description">{description}</p>

        <div className="hero__actions">
          <a className="hero__button hero__button--primary" href={loginHref}>
            {loginLabel}
          </a>
          <a className="hero__button hero__button--secondary" href={reportHref}>
            {reportLabel}
          </a>
          <a className="hero__button hero__button--secondary" href={announcementsHref}>
            {announcementsLabel}
          </a>
        </div>
      </div>

      <div className="hero__visual">
        <img
          className="hero__image"
          src={imageSrc}
          alt={imageAlt}
          width={420}
          height={420}
          decoding="async"
        />
      </div>
    </div>
  </section>
)

export default HeroSection
