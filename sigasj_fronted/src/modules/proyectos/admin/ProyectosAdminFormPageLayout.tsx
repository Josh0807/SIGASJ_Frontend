import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  IconArrowLeft,
  IconBuildingBridge,
  IconFolderPlus,
  IconPencil,
} from '@tabler/icons-react'
import { PROYECTOS_ADMIN_PATH } from './proyectosAdminPaths'

type ProyectosAdminFormPageLayoutProps = {
  children: ReactNode
  mode?: 'create' | 'edit'
  projectName?: string | null
}

const displayName = (nombre: string | null | undefined) => {
  if (!nombre?.trim()) return null
  return nombre.trim().replace(/\s+\d{10,}\s*$/, '').trim() || nombre.trim()
}

const ProyectosAdminFormPageLayout = ({
  children,
  mode,
  projectName,
}: ProyectosAdminFormPageLayoutProps) => {
  const isEditor = mode === 'create' || mode === 'edit'
  const cleanName = displayName(projectName)
  const headerEyebrow = isEditor
    ? mode === 'edit'
      ? 'Proyectos · Edición'
      : 'Proyectos · Alta'
    : 'Panel administrativo'
  const headerTitle = isEditor
    ? mode === 'edit'
      ? 'Editar proyecto'
      : 'Nuevo proyecto'
    : 'Gestión de Proyectos'
  const headerLead = isEditor
    ? mode === 'edit'
      ? cleanName
        ? `Editando «${cleanName}». Actualice datos, portada o la galería del proyecto.`
        : 'Actualice los datos del proyecto y guarde para volver al listado.'
      : 'Complete los datos y asigne una portada para registrar el proyecto.'
    : undefined

  return (
    <main className="gallery-admin proyectos-admin sigasj-project-form-layout admin-content-modern">
      <div className="gallery-admin__shell sigasj-stack sigasj-project-form-shell">
        <header
          className={`gallery-admin__header sigasj-project-form-header${
            isEditor ? ' gallery-admin__header--editor' : ''
          }`}
        >
          <div className="gallery-admin__header-copy">
            <span
              className={`gallery-admin__header-icon${
                mode === 'edit' ? ' gallery-admin__header-icon--edit' : ''
              }${mode === 'create' ? ' gallery-admin__header-icon--create' : ''}`}
              aria-hidden="true"
            >
              {mode === 'edit' ? (
                <IconPencil size={22} stroke={2.1} />
              ) : mode === 'create' ? (
                <IconFolderPlus size={22} stroke={2.1} />
              ) : (
                <IconBuildingBridge size={22} stroke={2.1} />
              )}
            </span>
            <div>
              <p className="gallery-admin__eyebrow">{headerEyebrow}</p>
              <h1 id={isEditor ? 'proyecto-editor-title' : undefined}>
                {headerTitle}
              </h1>
              {headerLead ? <p>{headerLead}</p> : null}
            </div>
          </div>
          <div className="gallery-admin__header-actions">
            {isEditor ? (
              <Link
                className="gallery-admin__link admin-modern-home-link gallery-admin__back-btn"
                to={PROYECTOS_ADMIN_PATH}
              >
                <IconArrowLeft size={17} aria-hidden="true" />
                Volver al listado
              </Link>
            ) : (
              <Link
                className="gallery-admin__link admin-modern-home-link"
                to="/admin/dashboard"
              >
                Volver inicio
              </Link>
            )}
          </div>
        </header>
        {children}
      </div>
    </main>
  )
}

export default ProyectosAdminFormPageLayout
