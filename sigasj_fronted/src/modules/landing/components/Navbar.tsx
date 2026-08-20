import { Link } from 'react-router-dom'
import type { NavbarProps } from '../types/NavbarProps'
import { ANNOUNCEMENTS_HREF, GALLERY_HREF, TRANSPARENCY_HREF } from '../config/landingAnchors'

type NavigationItem = {
  label: string
  href: `#${string}`
}

const navigationItems: NavigationItem[] = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Sobre nosotros', href: '#sobre-nosotros' },

  { label: 'Comunicados', href: ANNOUNCEMENTS_HREF },
  { label: 'Transparencia', href: TRANSPARENCY_HREF },

  { label: 'Solicitudes', href: '#solicitudes-servicio' },
  { label: 'Galería', href: GALLERY_HREF },
  { label: 'Contacto', href: '#contacto' },
  { label: 'Recibos y pagos', href: '#pagos' },
]

const Navbar = ({ className = '', onNavigate }: NavbarProps) => (
  <nav className={className} aria-label="Navegación principal">
    <ul className="navbar__list">
      {navigationItems.map(({ label, href }) => (
        <li key={href}>
          <a className="navbar__link" href={href} onClick={onNavigate}>
            {label}
          </a>
        </li>
      ))}
      <li>
        <Link className="navbar__login" to="/login" onClick={onNavigate}>
          Iniciar sesión
        </Link>
      </li>
    </ul>
  </nav>
)

export default Navbar
