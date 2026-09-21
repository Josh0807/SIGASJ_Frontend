import { useEffect, useRef, useState } from 'react'
import { IconChevronDown, IconUser } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import type { NavbarProps } from '../types/NavbarProps'
import { COMPLAINTS_HREF, GALLERY_HREF, TRANSPARENCY_HREF } from '../config/landingAnchors'

type NavigationItem = { label: string; href: `#${string}` }

const dropdownItems: NavigationItem[] = [
  { label: 'Sobre nosotros', href: '#sobre-nosotros' },
  { label: 'Transparencia', href: TRANSPARENCY_HREF },
  { label: 'Sugerencias y Quejas', href: COMPLAINTS_HREF },
  { label: 'Galería', href: GALLERY_HREF },
]

const directItems: NavigationItem[] = [
  { label: 'Solicitudes', href: '#solicitudes-servicio' },
  { label: 'Recibos y pagos', href: '#pagos' },
  { label: 'Contacto', href: '#contacto' },
]

const navLinkClass = 'relative flex min-h-11 items-center px-2 text-sm font-semibold text-[#173e6c] no-underline transition-colors after:absolute after:right-2 after:bottom-0 after:left-2 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-[#1477d4] after:transition-transform hover:text-[#1374ce] hover:after:scale-x-100 focus-visible:text-[#1374ce] focus-visible:outline-none focus-visible:after:scale-x-100 max-[1180px]:w-full max-[1180px]:rounded-lg max-[1180px]:px-3 max-[1180px]:after:hidden max-[1180px]:hover:bg-sky-50'

const Navbar = ({ className = '', onNavigate }: NavbarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDropdownOpen(false)
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

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    setIsDropdownOpen(false)
    onNavigate?.(event)
  }

  return (
    <nav data-ui="navbar" className={className} aria-label="Navegación principal">
      <ul className="m-0 flex list-none items-center gap-[clamp(0.75rem,2vw,2.5rem)] p-0 max-[1180px]:mx-auto max-[1180px]:w-[min(calc(100%-3rem),75rem)] max-[1180px]:flex-col max-[1180px]:items-stretch max-[1180px]:gap-1 max-[1180px]:py-4">
        <li><a className={`${navLinkClass} text-[#1374ce] after:scale-x-100`} href="#inicio" onClick={handleLinkClick}>Inicio</a></li>
        <li ref={dropdownRef} className="relative flex items-center max-[1180px]:w-full max-[1180px]:flex-col max-[1180px]:items-stretch" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
          <button className={`${navLinkClass} gap-2 border-0 bg-transparent font-[inherit] cursor-pointer max-[1180px]:justify-between`} type="button" aria-expanded={isDropdownOpen} aria-haspopup="true" onClick={() => setIsDropdownOpen((open) => !open)}>
            Institución
            <IconChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={18} stroke={2.2} aria-hidden="true" />
          </button>
          <ul className={`absolute top-full left-1/2 z-50 m-0 min-w-52 -translate-x-1/2 list-none rounded-xl border border-sky-100 bg-white p-2 shadow-[0_14px_35px_rgba(20,70,115,0.16)] max-[1180px]:static max-[1180px]:w-full max-[1180px]:translate-x-0 max-[1180px]:border-0 max-[1180px]:py-1 max-[1180px]:pl-4 max-[1180px]:shadow-none ${isDropdownOpen ? 'block' : 'hidden'}`} role="menu" aria-label="Secciones institucionales">
            {dropdownItems.map(({ label, href }) => (
              <li key={href} role="none"><a className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-[#254d76] no-underline transition hover:bg-sky-50 hover:text-[#1374ce]" href={href} role="menuitem" onClick={handleLinkClick}>{label}</a></li>
            ))}
          </ul>
        </li>
        {directItems.map(({ label, href }) => (
          <li key={href}><a className={navLinkClass} href={href} onClick={handleLinkClick}>{label}</a></li>
        ))}
        <li className="ml-2 max-[1180px]:ml-0">
          <Link className="flex min-h-11 items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-[#2494ee] to-[#0871d5] px-6 text-sm font-bold text-white no-underline shadow-[0_8px_20px_rgba(10,113,213,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(10,113,213,0.32)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-sky-400 max-[1180px]:mt-2 max-[1180px]:w-full" to="/login" onClick={handleLinkClick}>
            <IconUser size={24} stroke={2} aria-hidden="true" />
            Iniciar sesión
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
