import { IconPencil, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react'
import { Button } from '../../../shared/ui'
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
    <Button
      to={editTo}
      variant="primary"
      size="sm"
      aria-label={`Editar ${proyecto.nombre}`}
      leftIcon={<IconPencil size={16} aria-hidden="true" />}
    >
      Editar
    </Button>
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
