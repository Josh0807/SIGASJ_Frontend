import type { NavbarProps } from '../Props/NavbarProps'
import { ANNOUNCEMENTS_HREF, GALLERY_HREF } from '../config/landingAnchors'

type NavigationItem = {
  label: string
  href: `#${string}`
}

const navigationItems: NavigationItem[] = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Recibos y pagos', href: '#pagos' },
  { label: 'Sobre nosotros', href: '#sobre-nosotros' },
  { label: 'Comunicados', href: ANNOUNCEMENTS_HREF },
  { label: 'Solicitudes', href: '#solicitudes-servicio' },
  { label: 'Reporte de averías', href: '#reporte-averias' },
  { label: 'Galería', href: GALLERY_HREF },
  { label: 'Contacto', href: '#contacto' },
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
        <a className="navbar__login" href="/login" onClick={onNavigate}>
          Iniciar sesión
        </a>
      </li>
    </ul>
  </nav>
)

export default Navbar
