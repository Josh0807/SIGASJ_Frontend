import { Link } from 'react-router-dom'
import type { IndicatorBadgeType, IndicatorCardProps } from '../props'

export type { IndicatorBadgeType, IndicatorCardProps }

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
  const modernActivitiesStyle = className.includes('activities-indicator-modern')
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
      {icon || badgeText || !modernActivitiesStyle ? <div className={`indicator-card__top${modernActivitiesStyle ? ' !items-start' : ''}`}>
        {icon ? <span className={`indicator-card__icon${modernActivitiesStyle ? ' !grid !size-14 !place-items-center !rounded-2xl !border-0 !bg-linear-to-br !from-blue-600 !to-sky-500 !text-white !shadow-[0_9px_20px_rgba(37,99,235,0.25)] !transition-transform !duration-300 group-hover:!rotate-3 group-hover:!scale-105' : ''}`} aria-hidden="true">{icon}</span> : <div />}
        {badgeText ? (
          <span className={`indicator-card__badge indicator-card__badge--${badgeType}${modernActivitiesStyle ? ' !border !border-current/15 !px-3 !py-1.5 !font-extrabold' : ''}`}>
            {badgeText}
          </span>
        ) : null}
      </div> : null}

      <div className={`indicator-card__body${modernActivitiesStyle ? ' !mb-5' : ''}`}>
        <span
          className={`indicator-card__value ${
            !hasValue ? 'indicator-card__value--unavailable' : ''
          }${modernActivitiesStyle ? ' !text-[2.5rem] !font-black !tracking-[-0.04em] !text-[#062e63]' : ''}`}
          aria-label={!hasValue ? `${title}: No disponible` : undefined}
        >
          {displayValue}
        </span>
        <h3 className={`indicator-card__title${modernActivitiesStyle ? ' !text-base !font-extrabold !text-[#073b73]' : ''}`}>{title}</h3>
        {description ? <p className={`indicator-card__description${modernActivitiesStyle ? ' !leading-relaxed' : ''}`}>{description}</p> : null}
      </div>

      {link ? (
        <span className={`indicator-card__link-text${modernActivitiesStyle ? ' !inline-flex !w-fit !items-center !justify-center !rounded-xl !border !border-blue-200 !bg-blue-50 !px-4 !py-2.5 !font-extrabold !text-blue-700 !shadow-sm !transition-all !duration-300 group-hover:!border-blue-600 group-hover:!bg-blue-600 group-hover:!text-white group-hover:!shadow-md' : ''}`} aria-hidden="true">
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
