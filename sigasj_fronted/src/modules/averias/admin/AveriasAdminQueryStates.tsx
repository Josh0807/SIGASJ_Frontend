import type { ReactNode } from 'react'
import {
  AVERIAS_ADMIN_EMPTY_MESSAGE,
  AVERIAS_ADMIN_LOAD_ERROR,
  AVERIAS_ADMIN_LOADING_MESSAGE,
} from './types'

type AveriasAdminQueryStatesProps = {
  loading: boolean
  error: string | null
  hasResults: boolean
  onRetry?: () => void
  children: ReactNode
}

const SKELETON_ROWS = 5

const AveriasAdminQueryStates = ({
  loading,
  error,
  hasResults,
  onRetry,
  children,
}: AveriasAdminQueryStatesProps) => {
  if (loading && !hasResults) {
    return (
      <div role="status" aria-live="polite" aria-busy="true">
        <span className="visually-hidden">{AVERIAS_ADMIN_LOADING_MESSAGE}</span>
        <div className="gallery-admin__skeleton" aria-hidden="true">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <div className="gallery-admin__skeleton-row" key={index}>
              <span className="indicator-card__skeleton" />
              <span className="indicator-card__skeleton indicator-card__skeleton--badge" />
              <span className="indicator-card__skeleton" />
              <span className="indicator-card__skeleton indicator-card__skeleton--badge" />
              <span className="indicator-card__skeleton" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="gallery-admin__empty" role="alert">
        <p>{error || AVERIAS_ADMIN_LOAD_ERROR}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry}>
            Reintentar
          </button>
        ) : null}
      </div>
    )
  }

  if (!hasResults) {
    return (
      <p className="gallery-admin__empty" role="status">
        {AVERIAS_ADMIN_EMPTY_MESSAGE}
      </p>
    )
  }

  return (
    <div aria-busy={loading || undefined}>
      {children}
    </div>
  )
}

export default AveriasAdminQueryStates
