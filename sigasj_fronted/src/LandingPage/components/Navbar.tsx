type NavigationItem = {
  label: string
  href: `#${string}`
}

const navigationItems: NavigationItem[] = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Sobre nosotros', href: '#sobre-nosotros' },
  { label: 'Comunicados', href: '#comunicados' },
  { label: 'Reporte de averías', href: '#reporte-averias' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Contacto', href: '#contacto' },
]

type NavbarProps = {
  className?: string
  onNavigate?: () => void
}

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
