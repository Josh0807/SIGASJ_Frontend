import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ErrorBoundary from './ErrorBoundary'

describe('ErrorBoundary Component', () => {
  it('1. Renderiza los componentes hijos normalmente cuando no hay errores', () => {
    const markup = renderToStaticMarkup(
      <ErrorBoundary>
        <div>Contenido Seguro</div>
      </ErrorBoundary>,
    )

    expect(markup).toContain('Contenido Seguro')
  })

  it('2. getDerivedStateFromError captura el error y actualiza el estado hasError a true', () => {
    const testError = new Error('Error de prueba')
    const state = ErrorBoundary.getDerivedStateFromError(testError)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe(testError)
  })

  it('3. Renderiza la interfaz de recuperación (fallback UI) cuando existe un error en el estado', () => {
    const boundary = new ErrorBoundary({ children: <div>Contenido</div> })
    boundary.state = { hasError: true, error: new Error('Fallo simulado') }
    const markup = renderToStaticMarkup(boundary.render() as React.ReactElement)

    expect(markup).toContain('Algo salió mal en esta sección')
    expect(markup).toContain('Reintentar / Recargar')
  })

  it('4. Registra el error en consola al ejecutarse componentDidCatch', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const boundary = new ErrorBoundary({ children: <div>Contenido</div> })
      const err = new Error('Test log error')
      boundary.componentDidCatch(err, { componentStack: 'stack info' })
      expect(spy).toHaveBeenCalledWith('ErrorBoundary capturó un error no controlado:', err, {
        componentStack: 'stack info',
      })
    } finally {
      spy.mockRestore()
    }
  })
})
