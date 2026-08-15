import { NavLink } from 'react-router-dom'
import { ADMIN_NAV_ITEMS } from '../../routes/privateRoutes'

const AdminSidebar = () => (
  <aside className="admin-sidebar" aria-label="Menú administrativo">
    <p className="admin-sidebar__brand">SIGASJ</p>
    <nav className="admin-sidebar__nav" aria-label="Navegación administrativa">
      {ADMIN_NAV_ITEMS.map(({ path, title }) => (
        <NavLink
          key={path}
          to={path}
          end
          className="admin-sidebar__link"
        >
          {title}
        </NavLink>
      ))}
    </nav>
  </aside>
)

export default AdminSidebar
