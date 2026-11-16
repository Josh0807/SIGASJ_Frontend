import { Link } from 'react-router-dom'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'

type PublicReceiptNavbarProps = { returnTo?: string }

/**
 * Navbar fijo estilo landing (sólido) para páginas públicas fuera del home.
 */
export const PublicReceiptNavbar = ({ returnTo = '/' }: PublicReceiptNavbarProps) => {
  return (
    <header
      className="public-header public-header--solid sticky top-0 z-[100] w-full border-b border-sigasj-border bg-white/95 backdrop-blur-md"
      aria-label="Navegación pública"
    >
      <div className="public-container flex min-h-[64px] items-center justify-between gap-4 max-[520px]:min-h-[58px]">
        <Link
          className="flex min-w-0 items-center gap-3 rounded-[10px] no-underline"
          to="/"
          aria-label="SIGASJ San Juan, ir al inicio"
        >
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-sigasj-border bg-sigasj-surface shadow-sm max-[520px]:size-9">
            <img
              className="h-full w-full object-cover"
              src={asadaLogo}
              alt="Logo oficial de la ASADA San Juan de Santa Cruz"
            />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <strong className="font-sigasj-display text-lg font-bold tracking-wide text-sigasj-primary max-[520px]:text-base">
              SIGASJ
            </strong>
            <span className="truncate text-[12px] font-medium text-sigasj-muted max-[520px]:max-w-[160px] max-[420px]:hidden">
              ASADA San Juan de Santa Cruz
            </span>
          </span>
        </Link>

        <nav aria-label="Navegación de retorno">
          <Link
            className="transparency-motion-button inline-flex min-h-11 items-center justify-center rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-4 text-sm font-semibold text-sigasj-primary-hover no-underline"
            to={returnTo}
          >
            Volver
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default PublicReceiptNavbar
