import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { useAuthUser } from './useAuthUser'
import {
  clearAccessToken,
  setAuthUser,
} from '../utils/authStorage'
import { getAuthUserHeaderName, getAuthUserRoleLabel } from '../utils/authUserDisplay'

const UserProbe = () => {
  const user = useAuthUser()
  const name = getAuthUserHeaderName(user) ?? ''
  const role = getAuthUserRoleLabel(user) ?? ''

  return (
    <>
      <span data-testid="user-name">{name}</span>
      <span data-testid="user-role">{role}</span>
    </>
  )
}

describe('useAuthUser', () => {
  let container: HTMLDivElement
  let root: Root

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    clearAccessToken()
  })

  it('refleja cambios de sesión sin remontar el componente', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root.render(<UserProbe />)
    })

    expect(container.querySelector('[data-testid="user-name"]')?.textContent).toBe('')

    act(() => {
      setAuthUser({
        name: 'María',
        lastName: 'Solís',
        role: 'ADMINISTRADORA',
      })
    })

    expect(container.querySelector('[data-testid="user-name"]')?.textContent).toBe(
      'María Solís',
    )

    act(() => {
      clearAccessToken()
    })

    expect(container.querySelector('[data-testid="user-name"]')?.textContent).toBe('')
  })

  it('reemplaza nombre y rol al iniciar sesión con otro usuario', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root.render(<UserProbe />)
    })

    act(() => {
      setAuthUser({
        name: 'María',
        lastName: 'Solís',
        role: 'ADMINISTRADORA',
      })
    })

    expect(container.querySelector('[data-testid="user-name"]')?.textContent).toBe(
      'María Solís',
    )
    expect(container.querySelector('[data-testid="user-role"]')?.textContent).toBe(
      'Administradora',
    )

    act(() => {
      setAuthUser({
        name: 'Carlos',
        lastName: 'Mora',
        role: 'FONTANERO',
      })
    })

    expect(container.querySelector('[data-testid="user-name"]')?.textContent).toBe(
      'Carlos Mora',
    )
    expect(container.querySelector('[data-testid="user-role"]')?.textContent).toBe(
      'Fontanero',
    )
    expect(container.querySelector('[data-testid="user-name"]')?.textContent).not.toBe(
      'María Solís',
    )
  })
})
