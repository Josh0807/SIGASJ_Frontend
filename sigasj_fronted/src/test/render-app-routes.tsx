import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../modules/auth/components/AuthContext'
import AppRoutes from '../app/router/AppRoutes'
import { LocationProbe, type RouteLocation } from './location-probe'

export type { RouteLocation }

export const mountAppRoutes = async (path: string) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  let current: RouteLocation = { pathname: path, state: null }

  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <LocationProbe
            onLocation={(next) => {
              current = next
            }}
          />
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )
  })

  return {
    container,
    currentPath: () => current.pathname,
    currentState: () => current.state,
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}
