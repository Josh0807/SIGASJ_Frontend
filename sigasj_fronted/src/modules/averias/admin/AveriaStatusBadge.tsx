import { getEstadoAveriaPresentation } from './estadoAveria'

type AveriaStatusBadgeProps = {
  estado: string
  /** `flat` quita sombra/hover para el listado en tabla. */
  variant?: 'default' | 'flat'
}

const AveriaStatusBadge = ({ estado, variant = 'default' }: AveriaStatusBadgeProps) => {
  const presentation = getEstadoAveriaPresentation(estado)
  const variantClass = variant === 'flat' ? ' averias-admin__badge--flat' : ''

  return (
    <span
      className={`averias-admin__badge averias-admin__badge--estado ${presentation.modifier}${variantClass}`}
      aria-label={`Estado: ${presentation.label}`}
    >
      {presentation.label}
    </span>
  )
}

export default AveriaStatusBadge
