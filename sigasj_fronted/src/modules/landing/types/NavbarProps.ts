import type { MouseEventHandler } from 'react'

export interface NavbarProps {
  className?: string
  onNavigate?: MouseEventHandler<HTMLAnchorElement>
}
