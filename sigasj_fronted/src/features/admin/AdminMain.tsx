import type { ReactNode } from 'react'
import AdminHeader from './AdminHeader'

type AdminMainProps = {
  children: ReactNode
}

const AdminMain = ({ children }: AdminMainProps) => (
  <div className="admin-main">
    <AdminHeader />
    <div className="admin-main__content" aria-label="Contenido administrativo">
      {children}
    </div>
  </div>
)

export default AdminMain
