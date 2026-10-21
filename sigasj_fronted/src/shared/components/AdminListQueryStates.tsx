import type { ReactNode } from 'react'

export type AdminListQueryStatesProps = {
  loading: boolean
  error: string | null
  hasResults: boolean
  loadingMessage: string
  emptyMessage: string
  /** Si es false, cualquier loading muestra skeleton (oculta resultados previos). */
  keepPreviousResultsWhileLoading?: boolean
  onRetry?: () => void
  children: ReactNode
}

const SKELETON_ROWS = 5

/**
 * Estados de listado admin (loading / error / vacío) con markup gallery-admin.
 * Usado por averías, proyectos y listados que adopten el shell canónico.
 */
const AdminListQueryStates = ({
  loading,
  error,
  hasResults,
  loadingMessage,
  emptyMessage,
  keepPreviousResultsWhileLoading = true,
  onRetry,
  children,
}: AdminListQueryStatesProps) => {
  const showSkeleton = loading && (keepPreviousResultsWhileLoading ? !hasResults : true)

  if (showSkeleton) {
    return (
      <div role="status" aria-live="polite" aria-busy="true">
        <span className="visually-hidden">{loadingMessage}</span>
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
        <p>{error}</p>
        {onRetry ? (
          <button type="button" className="gallery-admin__button gallery-admin__button--primary" onClick={onRetry}>
            Reintentar
          </button>
        ) : null}
      </div>
    )
  }

  if (!hasResults) {
    return (
      <div className="gallery-admin__empty" role="status">
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div aria-busy={loading || undefined}>
      {children}
    </div>
  )
}

export default AdminListQueryStates
