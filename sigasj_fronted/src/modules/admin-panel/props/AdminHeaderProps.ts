import type { Ref } from 'react'

export type AdminHeaderProps = {
  menuOpen?: boolean
  onToggleMenu?: () => void
  menuToggleRef?: Ref<HTMLButtonElement>
}
