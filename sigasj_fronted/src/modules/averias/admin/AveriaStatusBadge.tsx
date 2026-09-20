import { getEstadoAveriaPresentation } from './estadoAveria'

type AveriaStatusBadgeProps = {
  estado: string
}

const AveriaStatusBadge = ({ estado }: AveriaStatusBadgeProps) => {
  const presentation = getEstadoAveriaPresentation(estado)

  return (
    <span
                    className={`averias-admin__badge averias-admin__badge--estado ${presentation.modifier} max-w-full`}
      aria-label={`Estado: ${presentation.label}`}
    >
      {presentation.label}
    </span>
  )
}

export default AveriaStatusBadge
