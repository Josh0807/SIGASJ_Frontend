import { Component, type ErrorInfo, type ReactNode } from 'react'
import type { ErrorBoundaryProps, ErrorBoundaryState } from '../props'

export type { ErrorBoundaryProps, ErrorBoundaryState }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary capturó un error no controlado:', error, errorInfo)
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary-fallback" role="alert" aria-live="assertive">
          <div className="error-boundary-fallback__content">
            <span className="error-boundary-fallback__icon" aria-hidden="true">⚠️</span>
            <h3 className="error-boundary-fallback__title">Algo salió mal en esta sección</h3>
            <p className="error-boundary-fallback__description">
              Ocurrió un error inesperado al renderizar la información. Puedes intentar recargar la sección.
            </p>
            <button
              type="button"
              className="error-boundary-fallback__btn"
              onClick={this.handleReset}
            >
              Reintentar / Recargar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
