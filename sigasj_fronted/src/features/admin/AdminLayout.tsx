import { Outlet } from 'react-router-dom'
import AdminMain from './AdminMain'
import AdminSidebar from './AdminSidebar'

const AdminLayout = () => (
  <div className="admin-layout">
    <AdminSidebar />
    <AdminMain>
      <Outlet />
    </AdminMain>
  </div>
)

export default AdminLayout
