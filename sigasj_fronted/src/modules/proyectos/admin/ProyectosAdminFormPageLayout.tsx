import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ProyectosAdminFormPageLayoutProps = {
  children: ReactNode
}

const ProyectosAdminFormPageLayout = ({
  children,
}: ProyectosAdminFormPageLayoutProps) => (
  <main className="gallery-admin proyectos-admin sigasj-project-form-layout admin-content-modern">
    <div className="gallery-admin__shell sigasj-stack sigasj-project-form-shell">
      <header className="gallery-admin__header sigasj-project-form-header">
        <div>
          <p className="gallery-admin__eyebrow">Panel administrativo</p>
          <h1>Gestión de Proyectos</h1>
        </div>
        <div className="gallery-admin__header-actions">
          <Link className="gallery-admin__link !inline-flex !items-center !justify-center !rounded-2xl !border !border-blue-200 !bg-white !px-6 !py-3.5 !font-bold !text-blue-700 !no-underline !shadow-md" to="/admin/dashboard">
            Volver inicio
          </Link>
        </div>
      </header>
      {children}
    </div>
  </main>
)

export default ProyectosAdminFormPageLayout
