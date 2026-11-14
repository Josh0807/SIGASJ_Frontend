import { IconArrowRight, IconTool } from '@tabler/icons-react'
import heroImage from '../../../assets/Hero1.webp'
import type { HeroSectionProps } from '../types/HeroSectionProps'
import { ANNOUNCEMENTS_HREF } from '../config/landingAnchors'
import { REPORTAR_AVERIA_ROUTE_PATH } from '../../../app/router/routePaths'
import Button from '../../../shared/ui/Button'

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
    data-ui="hero"
    className="public-hero"
    id={id}
    aria-labelledby="hero-title"
  >
    <div className="public-hero__media" aria-hidden="true">
      <img
        src={imageSrc}
        alt=""
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
      />
      <div className="public-hero__scrim" />
    </div>

    <div className="public-container public-hero__content">
      <div className="public-hero__copy">
        <p className="public-hero__eyebrow">
          ASADA San Juan de Santa Cruz
        </p>
        <h1 id="hero-title" className="public-hero__title">
          {title}
        </h1>
        <p className="public-hero__lead">
          {description}
        </p>

        <nav
          className="public-hero__actions"
          aria-label="Acciones principales"
        >
          <Button
            to={reportHref}
            variant="primary"
            size="md"
            leftIcon={<IconTool size={18} stroke={1.9} aria-hidden="true" />}
            rightIcon={<IconArrowRight size={18} stroke={1.9} aria-hidden="true" />}
            className="public-hero__cta max-[520px]:w-full"
          >
            {reportLabel}
          </Button>
          <Button
            href={announcementsHref}
            variant="secondary"
            size="md"
            className="public-hero__cta max-[520px]:w-full border-white/75 bg-white/15 text-white shadow-none hover:border-white hover:bg-white/25 hover:text-white"
          >
            {announcementsLabel}
          </Button>
        </nav>
      </div>
    </div>
  </section>
)

export default HeroSection
