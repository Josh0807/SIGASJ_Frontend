import { IconAlertTriangle } from '@tabler/icons-react'
import { getPrioridadLabel } from './types'

type AveriaPrioridadBadgeProps = {
  prioridad: string | null
}

const PRIORIDAD_MODIFIERS: Record<string, string> = {
  BAJA: 'is-baja',
  MEDIA: 'is-media',
  ALTA: 'is-alta',
  URGENTE: 'is-urgente',
}

const AveriaPrioridadBadge = ({ prioridad }: AveriaPrioridadBadgeProps) => {
  const label = getPrioridadLabel(prioridad)
  const key = prioridad?.trim().toUpperCase() ?? ''
  const modifier = PRIORIDAD_MODIFIERS[key] ?? 'is-sin-asignar'
  const showIcon = Boolean(PRIORIDAD_MODIFIERS[key])

  return (
    <span
      className={`averias-admin__prioridad-pill ${modifier}`}
      aria-label={`Prioridad: ${label}`}
    >
      {showIcon ? (
        <IconAlertTriangle size={14} stroke={2} aria-hidden="true" />
      ) : null}
      {label}
    </span>
  )
}

export default AveriaPrioridadBadge
