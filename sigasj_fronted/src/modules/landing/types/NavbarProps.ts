import type { MouseEventHandler } from 'react'

export interface NavbarProps {
  className?: string
  /** Nav flota sobre el hero: tipografía clara, sin fondo blanco. */
  overHero?: boolean
  /** Se invoca al navegar (enlace o login). Puede ignorar el evento. */
  onNavigate?: MouseEventHandler<HTMLAnchorElement> | (() => void)
}
