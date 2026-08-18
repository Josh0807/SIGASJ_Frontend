import type { ReactNode, Ref } from 'react'

export type AdminMainProps = {
  children: ReactNode
  menuOpen?: boolean
  onToggleMenu?: () => void
  menuToggleRef?: Ref<HTMLButtonElement>
}
