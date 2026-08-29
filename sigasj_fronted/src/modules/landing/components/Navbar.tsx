import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { NavbarProps } from '../types/NavbarProps'
import { GALLERY_HREF, TRANSPARENCY_HREF } from '../config/landingAnchors'

type NavigationItem = {
  label: string
  href: `#${string}`
}

const dropdownItems: NavigationItem[] = [
  { label: 'Sobre nosotros', href: '#sobre-nosotros' },
  { label: 'Transparencia', href: TRANSPARENCY_HREF },
  { label: 'Galería', href: GALLERY_HREF },
]

const directItems: NavigationItem[] = [
  { label: 'Solicitudes', href: '#solicitudes-servicio' },
  { label: 'Recibos y pagos', href: '#pagos' },
  { label: 'Contacto', href: '#contacto' },
]

const Navbar = ({ className = '', onNavigate }: NavbarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsDropdownOpen(false)
    onNavigate?.(e)
  }

  return (
    <nav className={className} aria-label="Navegación principal">
      <ul className="navbar__list">
        <li>
          <a className="navbar__link" href="#inicio" onClick={handleLinkClick}>
            Inicio
          </a>
        </li>

        <li
          ref={dropdownRef}
          className={`navbar__dropdown ${isDropdownOpen ? 'navbar__dropdown--open' : ''}`}
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button
            className="navbar__dropdown-toggle"
            type="button"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            Institución
            <svg
              className="navbar__dropdown-icon"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <ul className="navbar__dropdown-menu" role="menu" aria-label="Secciones institucionales">
            {dropdownItems.map(({ label, href }) => (
              <li key={href} role="none">
                <a className="navbar__dropdown-item" href={href} role="menuitem" onClick={handleLinkClick}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </li>

        {directItems.map(({ label, href }) => (
          <li key={href}>
            <a className="navbar__link" href={href} onClick={handleLinkClick}>
              {label}
            </a>
          </li>
        ))}

        <li>
          <Link className="navbar__login" to="/login" onClick={handleLinkClick}>
            Iniciar sesión
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar

