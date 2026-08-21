import { Link } from 'react-router-dom'
import type { NavbarProps } from '../types/NavbarProps'
import {
  ABOUT_HREF,
  ANNOUNCEMENTS_HREF,
  CONTACT_HREF,
  GALLERY_HREF,
  HOME_HREF,
  PAYMENTS_HREF,
  REPORT_FAULTS_HREF,
  REQUESTS_HREF,
  TRANSPARENCY_HREF,
} from '../config/landingAnchors'

type NavigationItem = {
  label: string
  href: `#${string}`
}

const primaryNavigation: NavigationItem[] = [
  { label: 'Inicio', href: HOME_HREF },
  { label: 'Sobre nosotros', href: ABOUT_HREF },
  { label: 'Comunicados', href: ANNOUNCEMENTS_HREF },
  { label: 'Contacto', href: CONTACT_HREF },
]

const servicesNavigation: NavigationItem[] = [
  { label: 'Recibos y pagos', href: PAYMENTS_HREF },
  { label: 'Solicitudes', href: REQUESTS_HREF },
  { label: 'Reportar avería', href: REPORT_FAULTS_HREF },
  { label: 'Galería', href: GALLERY_HREF },
  { label: 'Transparencia', href: TRANSPARENCY_HREF },
]

const Navbar = ({ className = '', onNavigate }: NavbarProps) => {
  const isMobile = className.includes('mobile')

  return (
    <nav className={className} aria-label="Navegación principal">
      <ul className="navbar__list">
        {primaryNavigation.map(({ label, href }) => (
          <li key={href}>
            <a className="navbar__link" href={href} onClick={onNavigate}>
              {label}
            </a>
          </li>
        ))}

        <li>
          {isMobile ? (
            <>
              <span className="navbar__link navbar__link--group-label">Servicios</span>
              <ul className="navbar__services-menu navbar__services-menu--mobile">
                {servicesNavigation.map(({ label, href }) => (
                  <li key={href}>
                    <a className="navbar__link" href={href} onClick={onNavigate}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <details className="navbar__services">
              <summary className="navbar__link">Servicios</summary>
              <ul className="navbar__services-menu">
                {servicesNavigation.map(({ label, href }) => (
                  <li key={href}>
                    <a className="navbar__link" href={href} onClick={onNavigate}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </li>

        <li>
          <Link className="navbar__login" to="/login" onClick={onNavigate}>
            Iniciar sesión
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
