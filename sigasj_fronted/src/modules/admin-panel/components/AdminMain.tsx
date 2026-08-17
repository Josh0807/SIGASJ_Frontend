import type { ReactNode, Ref } from 'react'
import AdminHeader from './AdminHeader'

type AdminMainProps = {
  children: ReactNode
  menuOpen?: boolean
  onToggleMenu?: () => void
  menuToggleRef?: Ref<HTMLButtonElement>
}

const AdminMain = ({
  children,
  menuOpen = false,
  onToggleMenu,
  menuToggleRef,
}: AdminMainProps) => (
  <div className="admin-main">
    <AdminHeader
      menuOpen={menuOpen}
      onToggleMenu={onToggleMenu}
      menuToggleRef={menuToggleRef}
    />
    <div className="admin-main__content" aria-label="Contenido administrativo">
      {children}
    </div>
  </div>
)

export default AdminMain
