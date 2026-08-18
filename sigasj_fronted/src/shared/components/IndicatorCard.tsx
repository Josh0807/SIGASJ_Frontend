import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type IndicatorBadgeType = 'success' | 'warning' | 'info' | 'alert' | 'default'

export type IndicatorCardProps = {
  /** Título del indicador (ej: "Abonados activos", "Lecturas pendientes") */
  title: string
  /** Valor numérico o de texto del indicador */
  value?: string | number | null
  /** Ícono o nodo React representativo */
  icon?: ReactNode
  /** Descripción secundaria o texto aclaratorio opcional */
  description?: string
  /** Texto de etiqueta o estado opcional */
  badgeText?: string
  /** Variante visual de la etiqueta (success, warning, info, alert, default) */
  badgeType?: IndicatorBadgeType
  /** Texto fallback cuando el valor es nulo o no disponible (por defecto: "N/D") */
  fallbackText?: string
  /** Enlace opcional a la sección detallada del indicador */
  link?: string
  /** Clases CSS adicionales */
  className?: string
  /** Estado de carga activo (muestra esqueleto animado) */
  isLoading?: boolean
  /** Estado de error activo en la consulta del indicador */
  isError?: boolean
  /** Mensaje aclaratorio de error */
  errorMessage?: string
  /** Función callback para reintentar la consulta de este indicador */
  onRetry?: () => void
}

/**
 * Comprueba si un valor es válido (no es null, undefined, cadena vacía o NaN).
 * El valor numérico 0 o la cadena "0" se consideran válidos.
 */
const isValueAvailable = (val: string | number | null | undefined): boolean => {
  if (val === null || val === undefined) return false
  if (typeof val === 'string' && val.trim() === '') return false
  if (typeof val === 'number' && Number.isNaN(val)) return false
  return true
}

/**
 * Componente reutilizable para mostrar tarjetas de indicadores o métricas del sistema.
 * Soporta estados de carga (Skeleton), error, reintento y diferenciación de cero vs no disponible.
 */
const IndicatorCard = ({
  title,
  value,
  icon,
  description,
  badgeText,
  badgeType = 'default',
  fallbackText = 'N/D',
  link,
  className = '',
  isLoading = false,
  isError = false,
  errorMessage = 'No se pudo cargar este dato',
  onRetry,
}: IndicatorCardProps) => {
  // 1. Estado de Carga (Skeleton Loader)
  if (isLoading) {
    return (
      <article
        className={`indicator-card indicator-card--loading ${className}`.trim()}
        aria-busy="true"
        aria-label={`Cargando indicador ${title}`}
      >
        <div className="indicator-card__top">
          <div className="indicator-card__skeleton indicator-card__skeleton--icon" />
          <div className="indicator-card__skeleton indicator-card__skeleton--badge" />
        </div>
        <div className="indicator-card__body">
          <div className="indicator-card__skeleton indicator-card__skeleton--value" />
          <div className="indicator-card__skeleton indicator-card__skeleton--title" />
          <div className="indicator-card__skeleton indicator-card__skeleton--desc" />
        </div>
      </article>
    )
  }

  // 2. Estado de Error
  if (isError) {
    return (
      <article className={`indicator-card indicator-card--error ${className}`.trim()} role="alert">
        <div className="indicator-card__top">
          {icon ? <span className="indicator-card__icon" aria-hidden="true">{icon}</span> : <div />}
          <span className="indicator-card__badge indicator-card__badge--alert">
            Error al cargar
          </span>
        </div>
        <div className="indicator-card__body">
          <span className="indicator-card__value indicator-card__value--unavailable">N/D</span>
          <h3 className="indicator-card__title">{title}</h3>
          <p className="indicator-card__error-text">{errorMessage}</p>
        </div>
        {onRetry ? (
          <button
            type="button"
            className="indicator-card__retry-button"
            onClick={onRetry}
            aria-label={`Reintentar la carga de ${title}`}
          >
            &#x21bb; Reintentar
          </button>
        ) : null}
      </article>
    )
  }

  // 3. Estado Normal / Sin Información
  const hasValue = isValueAvailable(value)
  const displayValue = hasValue ? String(value) : fallbackText

  const cardContent = (
    <>
      <div className="indicator-card__top">
        {icon ? <span className="indicator-card__icon" aria-hidden="true">{icon}</span> : <div />}
        {badgeText ? (
          <span className={`indicator-card__badge indicator-card__badge--${badgeType}`}>
            {badgeText}
          </span>
        ) : null}
      </div>

      <div className="indicator-card__body">
        <span
          className={`indicator-card__value ${
            !hasValue ? 'indicator-card__value--unavailable' : ''
          }`}
          aria-label={!hasValue ? `${title}: No disponible` : undefined}
        >
          {displayValue}
        </span>
        <h3 className="indicator-card__title">{title}</h3>
        {description ? <p className="indicator-card__description">{description}</p> : null}
      </div>

      {link ? (
        <span className="indicator-card__link-text" aria-hidden="true">
          Ver detalles &rarr;
        </span>
      ) : null}
    </>
  )

  const cardClasses = `indicator-card ${!hasValue ? 'indicator-card--unavailable' : ''} ${className}`.trim()

  if (link) {
    return (
      <Link
        to={link}
        className={`${cardClasses} indicator-card--interactive`}
        aria-label={`Ver detalles de ${title}: ${displayValue}`}
      >
        {cardContent}
      </Link>
    )
  }

  return <article className={cardClasses}>{cardContent}</article>
}

export default IndicatorCard
