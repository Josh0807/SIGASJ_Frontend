import { useEffect, useState } from 'react'
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
      <div className="header__inner">
        <a className="brand" href="#inicio" aria-label="SIGASJ, ir al inicio">
          <span className="brand__logo">
            <img src={asadaLogo} alt="Logo de la ASADA San Juan de Santa Cruz" />
          </span>
          <span className="brand__text">
            <strong>SIGASJ</strong>
            <span>ASADA San Juan de Santa Cruz</span>
          </span>
        </a>

        <Navbar className="navbar navbar--desktop" />

        <button
          className="menu-toggle"
          type="button"
          aria-label={isMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div id="mobile-navigation" className={`mobile-menu${isMenuOpen ? ' mobile-menu--open' : ''}`}>
        <Navbar className="navbar navbar--mobile" onNavigate={() => setIsMenuOpen(false)} />
      </div>
    </header>
  )
}

export default Header
