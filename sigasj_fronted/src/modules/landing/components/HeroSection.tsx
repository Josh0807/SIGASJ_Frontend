import gotinLogo from '../../../assets/Logo Gotin sin fondo.png'
import {
  ANNOUNCEMENTS_HREF,
  CONTACT_HREF,
  GALLERY_HREF,
  PAYMENTS_HREF,
  REPORT_FAULTS_HREF,
} from '../config/landingAnchors'
import type { HeroQuickAction, HeroSectionProps } from '../types/HeroSectionProps'

const ServiceIcon = ({ name }: { name: HeroQuickAction['icon'] }) => {
  const props = {
    className: 'hero-services__icon',
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': true as const,
  }

  switch (name) {
    case 'payments':
      return (
        <svg {...props}>
          <path d="M7 4h10a2 2 0 0 1 2 2v14l-4-2.5L11 20l-4-2.5V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      )
    case 'contact':
      return (
        <svg {...props}>
          <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      )
    case 'announcements':
      return (
        <svg {...props}>
          <path d="M5 10v4m14-4v4M7 6h10l1 14H6L7 6Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'gallery':
      return (
        <svg {...props}>
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="m9 12 2 2 4-4M8.5 9h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

const DEFAULT_QUICK_ACTIONS: HeroQuickAction[] = [
  { label: 'Pagos', title: 'Recibos y pagos', href: PAYMENTS_HREF, icon: 'payments' },
  { label: 'Contacto', title: 'Ubicación y teléfonos', href: CONTACT_HREF, icon: 'contact' },
  { label: 'Comunicados', title: 'Avisos oficiales', href: ANNOUNCEMENTS_HREF, icon: 'announcements' },
  { label: 'Galería', title: 'Imágenes institucionales', href: GALLERY_HREF, icon: 'gallery' },
]

const HeroSection = ({
  id = 'inicio',
  title = 'SIGASJ – Sistema de Gestión del Acueducto de ASADA San Juan',
  description = 'Una plataforma diseñada para acercar los servicios de la ASADA San Juan a nuestra comunidad, facilitando el acceso a información, comunicados y servicios importantes.',
  imageSrc = gotinLogo,
  imageAlt = 'Gotín, mascota de la ASADA San Juan de Santa Cruz relacionada con el servicio de agua potable',
  paymentsLabel = 'Consultar recibo y pagos',
  paymentsHref = PAYMENTS_HREF,
  reportLabel = 'Reportar una avería',
  reportHref = REPORT_FAULTS_HREF,
  quickActions = DEFAULT_QUICK_ACTIONS,
}: HeroSectionProps) => (
  <>
    <section className="hero" id={id} aria-labelledby="hero-title">
      <div className="hero__content">
        <div className="hero__copy">
          <p className="hero__eyebrow">ASADA San Juan de Santa Cruz</p>
          <h1 id="hero-title">{title}</h1>
          <p className="hero__description">{description}</p>

          <nav className="hero__actions" aria-label="Acciones principales">
            <a className="hero__button hero__button--primary" href={paymentsHref}>
              {paymentsLabel}
            </a>
            <a className="hero__button hero__button--secondary" href={reportHref}>
              {reportLabel}
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

    <nav className="hero-services" aria-label="Accesos rápidos a servicios">
      <div className="hero-services__inner">
        {quickActions.map(({ label, title: actionTitle, href, icon }) => (
          <a key={href} className="hero-services__link" href={href}>
            <ServiceIcon name={icon} />
            <span className="hero-services__text">
              <span className="hero-services__label">{label}</span>
              <span className="hero-services__title">{actionTitle}</span>
            </span>
          </a>
        ))}
      </div>
    </nav>
  </>
)

export default HeroSection
