import type { ReactNode } from 'react'
import AdminListQueryStates from '../../../shared/components/AdminListQueryStates'

type ProyectosAdminQueryStatesProps = {
  loading: boolean
  error: string | null
  hasResults: boolean
  hasActiveFilters: boolean
  onRetry: () => void
  children: ReactNode
}

const ProyectosAdminQueryStates = ({
  loading,
  error,
  hasResults,
  hasActiveFilters,
  onRetry,
  children,
}: ProyectosAdminQueryStatesProps) => (
  <AdminListQueryStates
    loading={loading}
    error={error}
    hasResults={hasResults}
    loadingMessage="Cargando proyectos…"
    emptyMessage={
      hasActiveFilters
        ? 'No se encontraron proyectos con los filtros seleccionados.'
        : 'No hay proyectos registrados.'
    }
    keepPreviousResultsWhileLoading={false}
    onRetry={onRetry}
  >
    {children}
  </AdminListQueryStates>
)

export default ProyectosAdminQueryStates
