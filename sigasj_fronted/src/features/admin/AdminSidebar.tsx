import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import asadaLogo from '../../assets/ASADA LOGO.jpeg'
import { ADMIN_NAV_ITEMS, type AdminNavItem } from '../../routes/privateRoutes'

export type AdminSidebarItem = AdminNavItem & {
  icon?: ReactNode
}

type AdminSidebarProps = {
  items?: AdminSidebarItem[]
}

const DefaultNavIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect
      x="3"
      y="3"
      width="14"
      height="14"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M6.5 10h7M10 6.5v7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)

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
          <span className="admin-sidebar__icon" aria-hidden="true">
            {icon ?? <DefaultNavIcon />}
          </span>
          <span className="admin-sidebar__label">{title}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
)

export default AdminSidebar
