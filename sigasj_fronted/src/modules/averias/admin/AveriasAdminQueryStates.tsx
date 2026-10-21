import type { ReactNode } from 'react'
import AdminListQueryStates from '../../../shared/components/AdminListQueryStates'
import {
  AVERIAS_ADMIN_EMPTY_MESSAGE,
  AVERIAS_ADMIN_LOAD_ERROR,
  AVERIAS_ADMIN_LOADING_MESSAGE,
} from './types'

type AveriasAdminQueryStatesProps = {
  loading: boolean
  error: string | null
  hasResults: boolean
  loadingMessage?: string
  emptyMessage?: string
  onRetry?: () => void
  children: ReactNode
}

const AveriasAdminQueryStates = ({
  loading,
  error,
  hasResults,
  loadingMessage = AVERIAS_ADMIN_LOADING_MESSAGE,
  emptyMessage = AVERIAS_ADMIN_EMPTY_MESSAGE,
  onRetry,
  children,
}: AveriasAdminQueryStatesProps) => (
  <AdminListQueryStates
    loading={loading}
    error={error ? error || AVERIAS_ADMIN_LOAD_ERROR : null}
    hasResults={hasResults}
    loadingMessage={loadingMessage}
    emptyMessage={emptyMessage}
    keepPreviousResultsWhileLoading
    onRetry={onRetry}
  >
    {children}
  </AdminListQueryStates>
)

export default AveriasAdminQueryStates
