import { StatusBadge } from '../../shared/ui'
import { estadoLabel } from './colaboradorForm'

export default function EstadoBadge({ activo }: { activo: boolean }) {
  return (
    <StatusBadge
      tone={activo ? 'success' : 'neutral'}
      className="gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold"
    >
      {estadoLabel(activo)}
    </StatusBadge>
  )
}
