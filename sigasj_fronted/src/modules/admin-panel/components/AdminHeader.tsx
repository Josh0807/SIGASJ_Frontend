import type { Ref } from 'react'

type AdminHeaderProps = {
  menuOpen?: boolean
  onToggleMenu?: () => void
  menuToggleRef?: Ref<HTMLButtonElement>
}

const AdminHeader = ({
  menuOpen = false,
  onToggleMenu,
  menuToggleRef,
}: AdminHeaderProps) => (
  <header className="admin-header">
    <button
      ref={menuToggleRef}
      className="admin-menu-toggle"
      type="button"
      aria-label={menuOpen ? 'Cerrar menú administrativo' : 'Abrir menú administrativo'}
      aria-controls="admin-navigation"
      aria-expanded={menuOpen}
      onClick={onToggleMenu}
    >
      <span />
      <span />
      <span />
    </button>
    <p className="admin-header__title">Panel administrativo</p>
    <div className="admin-header__actions" />
  </header>
)

export default AdminHeader
