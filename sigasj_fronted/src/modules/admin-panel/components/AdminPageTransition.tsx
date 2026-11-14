import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

/**
 * Animación de entrada al cambiar de módulo/ruta en el panel admin.
 */
const AdminPageTransition = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation()
  const moduleKey = pathname.split('/').slice(0, 3).join('/') || pathname

  return (
    <div
      key={moduleKey}
      className="admin-page-transition"
      data-pathname={pathname}
    >
      {children}
    </div>
  )
}

export default AdminPageTransition
