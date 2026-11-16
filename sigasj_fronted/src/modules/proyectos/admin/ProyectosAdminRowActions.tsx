import { Link } from 'react-router-dom'
import { IconPencil, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react'
import { type AdminProyecto } from './types'

type ProyectosAdminRowActionsProps = {
  proyecto: AdminProyecto
  editTo: string
  onToggleVisibilidad: (proyecto: AdminProyecto) => void
}

const ProyectosAdminRowActions = ({
  proyecto,
  editTo,
  onToggleVisibilidad,
}: ProyectosAdminRowActionsProps) => (
  <div className="gallery-admin__actions">
    <Link
      to={editTo}
      className="gallery-admin__button gallery-admin__button--primary"
      aria-label={`Editar ${proyecto.nombre}`}
    >
      <IconPencil size={16} aria-hidden="true" />
      Editar
    </Link>
    <button
      type="button"
      className={`gallery-admin__button${
        proyecto.activo
          ? ' proyectos-admin__action--pause'
          : ' proyectos-admin__action--play'
      }`}
      aria-label={`${proyecto.activo ? 'Inactivar' : 'Activar'} visibilidad de ${proyecto.nombre}`}
      onClick={() => onToggleVisibilidad(proyecto)}
    >
      {proyecto.activo ? (
        <IconPlayerPause size={16} aria-hidden="true" />
      ) : (
        <IconPlayerPlay size={16} aria-hidden="true" />
      )}
      {proyecto.activo ? 'Inactivar' : 'Activar'}
    </button>
  </div>
)

export default ProyectosAdminRowActions
