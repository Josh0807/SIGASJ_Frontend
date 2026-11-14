import { useEffect, useId, useRef, useState } from 'react'
import { IconMenu2, IconX } from '@tabler/icons-react'
import Navbar from './Navbar'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const reactId = useId().replace(/:/g, '')
  const menuId = `mobile-navigation-${reactId}`
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Histéresis: al bajar se solidifica pronto; al subir se mantiene sólido
    // hasta el tope del hero, para que el texto no se vuelva blanco sobre fondo claro.
    const SOLID_AFTER = 96
    const OVER_HERO_BELOW = 20
    let ticking = false

    const update = () => {
      const y = window.scrollY
      setIsScrolled((wasScrolled) =>
        wasScrolled ? y > OVER_HERO_BELOW : y > SOLID_AFTER,
      )
      ticking = false
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return
    const firstLink = menuPanelRef.current?.querySelector<HTMLElement>('a, button')
    firstLink?.focus()
  }, [isMenuOpen])

  const overHero = !isScrolled && !isMenuOpen

  return (
    <header
      data-scrolled={isScrolled ? 'true' : 'false'}
      className={`public-header fixed top-0 left-0 right-0 z-[100] w-full ${
        overHero ? 'public-header--over-hero' : 'public-header--solid'
      }`}
    >
      <div
        className={`public-container flex items-center justify-between gap-4 transition-[min-height] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          overHero ? 'min-h-[72px] max-[520px]:min-h-[64px]' : 'min-h-[64px] max-[520px]:min-h-[58px]'
        }`}
      >
        <a
          className="flex min-w-0 shrink-0 items-center gap-3 rounded-[10px] no-underline"
          href="#inicio"
          aria-label="SIGASJ, ir al inicio"
        >
          <span
            className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-sigasj-surface shadow-sm transition-[width,height,box-shadow,border-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              overHero
                ? 'size-12 border-2 border-white ring-2 ring-black/20 max-[520px]:size-11'
                : 'size-10 border border-sigasj-border max-[520px]:size-9'
            }`}
          >
            <img
              className="h-full w-full object-cover"
              src={asadaLogo}
              alt="Logo de la ASADA San Juan de Santa Cruz"
            />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <strong
              className={`font-sigasj-display font-bold tracking-wide transition-[color,font-size,text-shadow] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                overHero
                  ? 'text-xl text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85),0_2px_14px_rgba(0,0,0,0.55)] max-[520px]:text-lg'
                  : 'text-lg text-sigasj-primary [text-shadow:none] max-[520px]:text-base'
              }`}
            >
              SIGASJ
            </strong>
            <span
              className={`truncate text-[12px] font-medium transition-[color,opacity,text-shadow] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] max-[520px]:max-w-[160px] ${
                overHero
                  ? 'text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.8),0_2px_10px_rgba(0,0,0,0.45)]'
                  : 'text-sigasj-muted [text-shadow:none]'
              }`}
            >
              ASADA San Juan de Santa Cruz
            </span>
          </span>
        </a>

        <Navbar className="max-[1100px]:hidden" overHero={overHero} />

        <button
          ref={menuButtonRef}
          className={`hidden size-11 shrink-0 items-center justify-center rounded-[10px] transition-[background-color,border-color,color,box-shadow] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] max-[1100px]:flex ${
            overHero
              ? 'border border-white/80 bg-white/90 text-sigasj-primary shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:bg-white'
              : 'border border-sigasj-border bg-sigasj-surface text-sigasj-primary hover:bg-sigasj-surface-soft'
          }`}
          type="button"
          aria-label={isMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-controls={menuId}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? (
            <IconX size={22} aria-hidden="true" />
          ) : (
            <IconMenu2 size={22} aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        ref={menuPanelRef}
        id={menuId}
        className={`border-t border-sigasj-border bg-sigasj-surface min-[1101px]:hidden ${isMenuOpen ? 'block' : 'hidden'}`}
      >
        <Navbar onNavigate={() => setIsMenuOpen(false)} />
      </div>
    </header>
  )
}

export default Header
