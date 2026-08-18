import type { ReactNode } from 'react'

export type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

export type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}
