import { NavLink } from 'react-router-dom'
import asadaLogo from '../../assets/ASADA LOGO.jpeg'
import { ADMIN_NAV_ITEMS, type AdminNavItem } from '../../routes/privateRoutes'
import AdminNavIcon, { type AdminNavIconName } from './AdminNavIcon'

export type AdminSidebarItem = AdminNavItem & {
  icon: AdminNavIconName
}

type AdminSidebarProps = {
  items?: AdminSidebarItem[]
}

const AdminSidebar = ({ items = ADMIN_NAV_ITEMS }: AdminSidebarProps) => (
  <aside className="admin-sidebar" aria-label="Menú administrativo">
    <div className="admin-sidebar__brand">
      <span className="admin-sidebar__logo">
        <img src={asadaLogo} alt="" />
      </span>
      <span className="admin-sidebar__brand-text">
        <strong>SIGASJ</strong>
        <span>ASADA San Juan</span>
      </span>
    </div>
    <nav className="admin-sidebar__nav" aria-label="Navegación administrativa">
      {items.map(({ path, title, icon }) => (
        <NavLink key={path} to={path} end className="admin-sidebar__link">
          <span className="admin-sidebar__icon" aria-hidden="true" data-icon={icon}>
            <AdminNavIcon name={icon} />
          </span>
          <span className="admin-sidebar__label">{title}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
)

export default AdminSidebar
