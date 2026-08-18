import { Link } from 'react-router-dom'
import type { QuickAccessCardProps } from '../props'

export type { QuickAccessCardProps }

/**
 * Componente reutilizable para tarjetas/botones de acceso rápido a módulos administrativos.
 */
const QuickAccessCard = ({
  title,
  path,
  description,
  icon,
  isAuthorized = true,
  badgeText,
  className = '',
}: QuickAccessCardProps) => {
  // Si la opción no está autorizada, no se muestra
  if (!isAuthorized) {
    return null
  }

  const cardClasses = `quick-access-card ${className}`.trim()

  return (
    <Link
      to={path}
      className={cardClasses}
      aria-label={`Acceso rápido a ${title}`}
    >
      {icon ? (
        <div className="quick-access-card__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}

      <div className="quick-access-card__content">
        <div className="quick-access-card__header">
          <h3 className="quick-access-card__title">{title}</h3>
          {badgeText ? (
            <span className="quick-access-card__badge">{badgeText}</span>
          ) : null}
        </div>
        {description ? (
          <p className="quick-access-card__description">{description}</p>
        ) : null}
      </div>

      <span className="quick-access-card__arrow" aria-hidden="true">
        &rarr;
      </span>
    </Link>
  )
}

export default QuickAccessCard
