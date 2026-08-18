import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { useIsAuthenticated } from './useIsAuthenticated'
import {
  clearAccessToken,
  setAccessToken,
  setAuthUser,
} from '../utils/authStorage'

const AuthProbe = () => {
  const authenticated = useIsAuthenticated()

  return <span data-testid="authenticated">{authenticated ? 'true' : 'false'}</span>
}

describe('useIsAuthenticated', () => {
  let container: HTMLDivElement
  let root: Root

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    clearAccessToken()
  })

  it('refleja el estado de sesión sin remontar el componente', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root.render(<AuthProbe />)
    })

    expect(container.querySelector('[data-testid="authenticated"]')?.textContent).toBe(
      'false',
    )

    act(() => {
      setAccessToken('token-demo')
    })

    expect(container.querySelector('[data-testid="authenticated"]')?.textContent).toBe(
      'true',
    )

    act(() => {
      clearAccessToken()
    })

    expect(container.querySelector('[data-testid="authenticated"]')?.textContent).toBe(
      'false',
    )
  })

  it('invalida la sesión al cerrar sesión aunque exista perfil de usuario', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root.render(<AuthProbe />)
    })

    act(() => {
      setAccessToken('token-demo')
      setAuthUser({ name: 'María', role: 'ADMINISTRADORA' })
    })

    expect(container.querySelector('[data-testid="authenticated"]')?.textContent).toBe(
      'true',
    )

    act(() => {
      clearAccessToken()
    })

    expect(container.querySelector('[data-testid="authenticated"]')?.textContent).toBe(
      'false',
    )
  })
})
