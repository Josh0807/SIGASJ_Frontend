import type { ReactNode } from 'react'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
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
    loadingMessage={ADMIN_COPY.loading('proyectos')}
    emptyMessage={
      hasActiveFilters
        ? ADMIN_COPY.emptyFiltered('proyectos')
        : ADMIN_COPY.empty('proyectos registrados')
    }
    keepPreviousResultsWhileLoading={false}
    onRetry={onRetry}
  >
    {children}
  </AdminListQueryStates>
)

export default ProyectosAdminQueryStates
