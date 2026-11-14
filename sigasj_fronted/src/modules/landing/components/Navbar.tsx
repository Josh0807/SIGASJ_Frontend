import { useEffect, useMemo, useRef, useState } from 'react'
import { IconChevronDown, IconUser } from '@tabler/icons-react'
import type { NavbarProps } from '../types/NavbarProps'
import {
  COMPLAINTS_HREF,
  GALLERY_HREF,
  TRANSPARENCY_HREF,
} from '../config/landingAnchors'
import { useLandingActiveNav } from '../hooks/useLandingActiveNav'
import Button from '../../../shared/ui/Button'

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

const navLinkBase =
  'relative flex min-h-11 items-center px-2 text-sm no-underline transition-[color,text-shadow,background-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] after:absolute after:right-2 after:bottom-0 after:left-2 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:transition-[transform,background-color,box-shadow] after:duration-400 hover:after:scale-x-100 focus-visible:outline-none focus-visible:after:scale-x-100 max-[1100px]:w-full max-[1100px]:rounded-[10px] max-[1100px]:px-3 max-[1100px]:after:hidden max-[1100px]:hover:bg-sigasj-surface-soft'

const Navbar = ({ className = '', overHero = false, onNavigate }: NavbarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLLIElement>(null)
  const trackedIds = useMemo(
    () => [
      'sobre-nosotros',
      'transparencia',
      'quejas',
      'galeria',
      'solicitudes-servicio',
      'pagos',
      'contacto',
      'comunicados',
      'accesos-rapidos',
      'proyectos',
    ],
    [],
  )
  const activeId = useLandingActiveNav(trackedIds)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
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

  const notifyNavigate = (event?: React.MouseEvent<HTMLAnchorElement>) => {
    setIsDropdownOpen(false)
    if (!onNavigate) return
    if (event) {
      ;(onNavigate as (e: React.MouseEvent<HTMLAnchorElement>) => void)(event)
    } else {
      ;(onNavigate as () => void)()
    }
  }

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    notifyNavigate(event)
  }

  const isActive = (href: string) => activeId === href.slice(1)
  const institutionActive = dropdownItems.some((item) => isActive(item.href))
  const linkTone = overHero
    ? 'font-bold text-white tracking-[0.01em] [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_2px_12px_rgba(0,0,0,0.55)] after:h-[3px] after:bg-white after:shadow-[0_1px_4px_rgba(0,0,0,0.45)] hover:text-white focus-visible:text-white'
    : 'font-semibold text-sigasj-text after:bg-sigasj-primary hover:text-sigasj-primary focus-visible:text-sigasj-primary'
  const activeTone = overHero
    ? 'text-white after:scale-x-100'
    : 'text-sigasj-primary after:scale-x-100'

  return (
    <nav data-ui="navbar" className={className} aria-label="Navegación principal">
      <ul className="m-0 flex list-none items-center gap-[clamp(0.5rem,1.5vw,1.75rem)] p-0 max-[1100px]:mx-auto max-[1100px]:w-[min(calc(100%-2rem),40rem)] max-[1100px]:flex-col max-[1100px]:items-stretch max-[1100px]:gap-1 max-[1100px]:py-4">
        <li>
          <a
            className={`${navLinkBase} ${linkTone} ${isActive('#inicio') ? activeTone : ''}`}
            href="#inicio"
            aria-current={isActive('#inicio') ? 'true' : undefined}
            onClick={handleLinkClick}
          >
            Inicio
          </a>
        </li>

        <li
          ref={dropdownRef}
          className="relative flex items-center max-[1100px]:w-full max-[1100px]:flex-col max-[1100px]:items-stretch"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button
            className={`${navLinkBase} ${linkTone} gap-2 border-0 bg-transparent font-[inherit] cursor-pointer max-[1100px]:justify-between ${institutionActive ? activeTone : ''}`}
            type="button"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            onClick={() => setIsDropdownOpen((open) => !open)}
          >
            Institución
            <IconChevronDown
              className={`transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`}
              size={18}
              stroke={1.9}
              aria-hidden="true"
            />
          </button>
          <ul
            className={`absolute top-full left-1/2 z-50 m-0 min-w-52 -translate-x-1/2 list-none rounded-[13px] border border-sigasj-border bg-sigasj-surface p-2 shadow-[0_8px_24px_rgba(16,43,56,0.08)] max-[1100px]:static max-[1100px]:w-full max-[1100px]:translate-x-0 max-[1100px]:border-0 max-[1100px]:py-1 max-[1100px]:pl-4 max-[1100px]:shadow-none ${isDropdownOpen ? 'block' : 'hidden'}`}
            role="menu"
            aria-label="Secciones institucionales"
          >
            {dropdownItems.map(({ label, href }) => (
              <li key={href} role="none">
                <a
                  className={`block rounded-[10px] px-4 py-2.5 text-sm font-semibold no-underline transition-colors duration-150 hover:bg-sigasj-surface-soft hover:text-sigasj-primary ${isActive(href) ? 'bg-sigasj-surface-soft text-sigasj-primary' : 'text-sigasj-text'}`}
                  href={href}
                  role="menuitem"
                  aria-current={isActive(href) ? 'true' : undefined}
                  onClick={handleLinkClick}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </li>

        {directItems.map(({ label, href }) => (
          <li key={href}>
            <a
              className={`${navLinkBase} ${linkTone} ${isActive(href) ? activeTone : ''}`}
              href={href}
              aria-current={isActive(href) ? 'true' : undefined}
              onClick={handleLinkClick}
            >
              {label}
            </a>
          </li>
        ))}

        <li className="ml-1 max-[1100px]:ml-0 max-[1100px]:mt-2">
          <Button
            to="/login"
            variant="secondary"
            size="sm"
            leftIcon={<IconUser size={18} stroke={1.9} aria-hidden="true" />}
            className={`max-[1100px]:w-full transition-[background-color,border-color,color,box-shadow] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              overHero
                ? 'border-transparent bg-white text-sigasj-primary shadow-[0_6px_20px_rgba(0,0,0,0.28)] hover:bg-white hover:text-sigasj-primary-hover'
                : ''
            }`}
            onClick={() => notifyNavigate()}
          >
            Iniciar sesión
          </Button>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
