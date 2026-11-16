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
  <div className="flex flex-wrap items-center justify-end gap-2">
    <Button
      to={editTo}
      variant="secondary"
      size="sm"
      aria-label={`Editar ${proyecto.nombre}`}
      leftIcon={<IconPencil size={16} aria-hidden="true" />}
    >
      Editar
    </Button>
    <Button
      type="button"
      variant="secondary"
      size="sm"
      aria-label={`${proyecto.activo ? 'Inactivar' : 'Activar'} visibilidad de ${proyecto.nombre}`}
      onClick={() => onToggleVisibilidad(proyecto)}
      leftIcon={
        proyecto.activo ? (
          <IconPlayerPause size={16} aria-hidden="true" />
        ) : (
          <IconPlayerPlay size={16} aria-hidden="true" />
        )
      }
    >
      {proyecto.activo ? 'Inactivar' : 'Activar'}
    </Button>
  </div>
)

export default ProyectosAdminRowActions
