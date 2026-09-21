import { useEffect, useState } from 'react'
import { IconMenu2, IconX } from '@tabler/icons-react'
import Navbar from './Navbar'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <header className="header">
      <div data-ui="header__inner" className="mx-auto flex min-h-[86px] w-[min(calc(100%-3rem),1320px)] items-center justify-between gap-6 max-[520px]:min-h-[74px] max-[520px]:w-[calc(100%-1.75rem)]">
        <a className="flex shrink-0 items-center gap-3 rounded-xl no-underline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-sky-400" href="#inicio" aria-label="SIGASJ, ir al inicio">
          <span className="grid size-[58px] shrink-0 place-items-center overflow-hidden rounded-full border border-sky-100 bg-white p-1 shadow-[0_4px_18px_rgba(18,92,164,0.15)] max-[520px]:size-[46px]">
            <img className="h-full w-full rounded-full object-cover" src={asadaLogo} alt="Logo de la ASADA San Juan de Santa Cruz" />
          </span>
          <span className="flex flex-col leading-tight">
            <strong className="text-[1.4rem] font-extrabold tracking-[0.04em] text-[#1670c8] max-[520px]:text-lg">SIGASJ</strong>
            <span className="text-xs font-semibold text-[#285b91] max-[520px]:max-w-[180px] max-[520px]:text-[0.66rem]">ASADA San Juan de Santa Cruz</span>
          </span>
        </a>

        <Navbar className="max-[1180px]:hidden" />

        <button
          className="hidden size-12 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-[#1268b9] transition hover:bg-sky-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 max-[1180px]:flex"
          type="button"
          aria-label={isMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <IconX size={27} aria-hidden="true" /> : <IconMenu2 size={27} aria-hidden="true" />}
        </button>
      </div>

      <div id="mobile-navigation" className={`border-t border-slate-100 bg-white/98 shadow-lg min-[1181px]:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <Navbar onNavigate={() => setIsMenuOpen(false)} />
      </div>
    </header>
  )
}

export default Header
