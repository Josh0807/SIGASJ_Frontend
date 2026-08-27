import { Link } from 'react-router-dom'

type ProyectosAdminRowActionsProps = {
  nombre: string
  editTo: string
}

const ProyectosAdminRowActions = ({
  nombre,
  editTo,
}: ProyectosAdminRowActionsProps) => (
  <div className="gallery-admin__actions">
    <button type="button" aria-label={`Ver ${nombre}`}>
      Ver
    </button>
    <Link to={editTo} aria-label={`Editar ${nombre}`}>
      Editar
    </Link>
    <button type="button" aria-label={`Gestionar imágenes de ${nombre}`}>
      Gestionar imágenes
    </button>
  </div>
)

export default ProyectosAdminRowActions
