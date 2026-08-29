import { Link } from 'react-router-dom'
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
    <button type="button" aria-label={`Ver ${proyecto.nombre}`}>
      Ver
    </button>
    <Link to={editTo} aria-label={`Editar ${proyecto.nombre}`}>
      Editar
    </Link>
    <button type="button" aria-label={`Gestionar imágenes de ${proyecto.nombre}`}>
      Gestionar imágenes
    </button>
    <button
      type="button"
      className={
        proyecto.activo ? 'gallery-admin__button--danger' : 'gallery-admin__button'
      }
      aria-label={`${proyecto.activo ? 'Inactivar' : 'Activar'} visibilidad de ${proyecto.nombre}`}
      onClick={() => onToggleVisibilidad(proyecto)}
    >
      {proyecto.activo ? 'Inactivar' : 'Activar'}
    </button>
  </div>
)


export default ProyectosAdminRowActions

