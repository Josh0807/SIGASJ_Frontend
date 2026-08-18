import type { Ref } from 'react'
import type { AdminNavItem } from '../../../app/router/privateRoutes'
import type { AdminNavIconName } from './AdminNavIconProps'

export type AdminSidebarItem = AdminNavItem & {
  icon: AdminNavIconName
}

export type AdminSidebarProps = {
  items?: AdminSidebarItem[]
  isDrawer?: boolean
  isOpen?: boolean
  onNavigate?: () => void
  onClose?: () => void
  closeButtonRef?: Ref<HTMLButtonElement>
}
