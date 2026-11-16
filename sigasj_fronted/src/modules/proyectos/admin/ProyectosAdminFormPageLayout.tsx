import type { ReactNode } from 'react'
import {
  IconArrowLeft,
  IconBuildingBridge,
  IconFolderPlus,
  IconPencil,
} from '@tabler/icons-react'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import { AdminShell, Button, PageHeader } from '../../../shared/ui'
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

  const titleIcon =
    mode === 'edit' ? (
      <IconPencil size={22} aria-hidden="true" />
    ) : mode === 'create' ? (
      <IconFolderPlus size={22} aria-hidden="true" />
    ) : (
      <IconBuildingBridge size={22} aria-hidden="true" />
    )

  return (
    <AdminShell
      className="proyectos-admin sigasj-project-form-layout min-w-0"
      aria-labelledby={isEditor ? 'proyecto-editor-title' : undefined}
    >
      <PageHeader
        id={isEditor ? 'proyecto-editor-title' : undefined}
        eyebrow={headerEyebrow}
        title={
          <span className="inline-flex items-center gap-2">
            {titleIcon}
            {headerTitle}
          </span>
        }
        description={headerLead}
        actions={
          isEditor ? (
            <Button
              to={PROYECTOS_ADMIN_PATH}
              variant="secondary"
              leftIcon={<IconArrowLeft size={17} aria-hidden="true" />}
            >
              {ADMIN_COPY.backToList}
            </Button>
          ) : (
            <Button to="/admin/dashboard" variant="ghost">
              {ADMIN_COPY.backHome}
            </Button>
          )
        }
      />
      <div className="sigasj-project-form-shell min-w-0">{children}</div>
    </AdminShell>
  )
}

export default ProyectosAdminFormPageLayout