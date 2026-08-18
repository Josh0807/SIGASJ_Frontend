import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type QuickAccessCardProps = {
  /** Nombre o título de la función/módulo */
  title: string
  /** Ruta administrativa de destino (React Router SPA) */
  path: string
  /** Descripción corta o detalle funcional */
  description?: string
  /** Ícono o nodo React representativo */
  icon?: ReactNode
  /** Indica si la opción está autorizada para el usuario actual (por defecto: true) */
  isAuthorized?: boolean
  /** Etiqueta o badge secundario opcional */
  badgeText?: string
  /** Clases CSS adicionales */
  className?: string
}

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
