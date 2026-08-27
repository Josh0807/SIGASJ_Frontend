import type { ReactNode } from 'react'

type ProyectosAdminQueryStatesProps = {
  loading: boolean
  error: string | null
  hasResults: boolean
  hasActiveFilters: boolean
  onRetry: () => void
  children: ReactNode
}

const SKELETON_ROWS = 5

const ProyectosAdminQueryStates = ({
  loading,
  error,
  hasResults,
  hasActiveFilters,
  onRetry,
  children,
}: ProyectosAdminQueryStatesProps) => {
  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true">
        <span className="visually-hidden">Cargando proyectos…</span>
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
        <button type="button" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    )
  }

  if (!hasResults) {
    return (
      <p className="gallery-admin__empty" role="status">
        {hasActiveFilters
          ? 'No se encontraron proyectos con los filtros seleccionados.'
          : 'No hay proyectos registrados.'}
      </p>
    )
  }

  return children
}

export default ProyectosAdminQueryStates
