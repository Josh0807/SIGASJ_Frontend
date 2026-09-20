import AdminHeader from './AdminHeader'
import ErrorBoundary from '../../../shared/components/ErrorBoundary'
import type { AdminMainProps } from '../props'

export type { AdminMainProps }

const AdminMain = ({
  children,
  menuOpen = false,
  onToggleMenu,
  menuToggleRef,
}: AdminMainProps) => (
  <div className="admin-main min-w-0 flex-1">
    <AdminHeader
      menuOpen={menuOpen}
      onToggleMenu={onToggleMenu}
      menuToggleRef={menuToggleRef}
    />
    <div className="admin-main__content min-w-0" aria-label="Contenido administrativo">
      <div className="admin-main__inner w-full min-w-0">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  </div>
)

export default AdminMain
