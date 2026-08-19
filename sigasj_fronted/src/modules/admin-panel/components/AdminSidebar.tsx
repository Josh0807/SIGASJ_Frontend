import { NavLink } from 'react-router-dom'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'
import AdminNavIcon from './AdminNavIcon'
import AdminUserMenu from './AdminUserMenu'
import type { AdminSidebarItem, AdminSidebarProps } from '../props'

export type { AdminSidebarItem, AdminSidebarProps }

const AdminSidebar = ({
  items = [],
  isDrawer = false,
  isOpen = false,
  onNavigate,
  onClose,
  closeButtonRef,
}: AdminSidebarProps) => (
  <aside
    id="admin-navigation"
    className="admin-sidebar"
    aria-label="Menú administrativo"
    role={isDrawer && isOpen ? 'dialog' : undefined}
    aria-modal={isDrawer && isOpen ? true : undefined}
    inert={isDrawer && !isOpen ? true : undefined}
  >
    <div className="admin-sidebar__brand">
      <span className="admin-sidebar__logo">
        <img src={asadaLogo} alt="" />
      </span>
      <span className="admin-sidebar__brand-text">
        <strong>SIGASJ</strong>
        <span>ASADA San Juan</span>
      </span>
      <button
        ref={closeButtonRef}
        className="admin-sidebar__close"
        type="button"
        aria-label="Cerrar menú administrativo"
        onClick={onClose}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
    </div>
    <nav className="admin-sidebar__nav" aria-label="Navegación administrativa">
      {items.map(({ path, title, icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            isActive
              ? 'admin-sidebar__link admin-sidebar__link--active'
              : 'admin-sidebar__link'
          }
          onClick={onNavigate}
        >
          {({ isActive }) => (
            <>
              <span className="admin-sidebar__icon" aria-hidden="true" data-icon={icon}>
                <AdminNavIcon name={icon} />
              </span>
              <span className="admin-sidebar__label">{title}</span>
              {isActive ? (
                <span className="admin-sidebar__active-mark" aria-hidden="true" />
              ) : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
    <div className="admin-sidebar__footer">
      <AdminUserMenu variant="sidebar" />
    </div>
  </aside>
)

export default AdminSidebar
