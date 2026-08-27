import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PROYECTOS_ADMIN_PATH } from './proyectosAdminPaths'

type ProyectosAdminFormPageLayoutProps = {
  children: ReactNode
}

const ProyectosAdminFormPageLayout = ({
  children,
}: ProyectosAdminFormPageLayoutProps) => (
  <main className="gallery-admin proyectos-admin">
    <div className="gallery-admin__shell">
      <header className="gallery-admin__header">
        <div>
          <p className="gallery-admin__eyebrow">Panel administrativo</p>
          <h1>Gestión de Proyectos</h1>
        </div>
        <div className="gallery-admin__header-actions">
          <Link className="gallery-admin__link" to={PROYECTOS_ADMIN_PATH}>
            Volver al listado
          </Link>
        </div>
      </header>
      {children}
    </div>
  </main>
)

export default ProyectosAdminFormPageLayout
