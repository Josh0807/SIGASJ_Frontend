import type { Ref } from 'react'
import AdminNavIcon from './AdminNavIcon'

export type AdminHeaderMenuToggleProps = {
  menuOpen?: boolean
  onToggleMenu?: () => void
  menuToggleRef?: Ref<HTMLButtonElement>
}

const AdminHeaderMenuToggle = ({
  menuOpen = false,
  onToggleMenu,
  menuToggleRef,
}: AdminHeaderMenuToggleProps) => (
  <button
    ref={menuToggleRef}
    className="admin-menu-toggle"
    type="button"
    aria-label={
      menuOpen ? 'Cerrar menú administrativo' : 'Abrir menú administrativo'
    }
    aria-controls="admin-navigation"
    aria-expanded={menuOpen}
    onClick={onToggleMenu}
  >
    <AdminNavIcon name={menuOpen ? 'menuClose' : 'menu'} />
  </button>
)

export default AdminHeaderMenuToggle
