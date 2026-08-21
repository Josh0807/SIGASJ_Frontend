import {
  CONTACT_HREF,
  PAYMENTS_HREF,
  REPORT_FAULTS_HREF,
} from '../config/landingAnchors'

const LandingMobileBar = () => (
  <nav className="landing-mobile-bar" aria-label="Acciones rápidas móviles">
    <a className="landing-mobile-bar__link landing-mobile-bar__link--emphasis" href={PAYMENTS_HREF}>
      <svg className="landing-mobile-bar__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 4h10a2 2 0 0 1 2 2v14l-4-2.5L11 20l-4-2.5V6a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      Recibos
    </a>
    <a className="landing-mobile-bar__link" href={REPORT_FAULTS_HREF}>
      <svg className="landing-mobile-bar__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 9v4m0 4h.01M4.5 19h15l-1.5-12h-12L4.5 19Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Avería
    </a>
    <a className="landing-mobile-bar__link" href={CONTACT_HREF}>
      <svg className="landing-mobile-bar__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M8 9h8M8 12.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      Contacto
    </a>
  </nav>
)

export default LandingMobileBar
