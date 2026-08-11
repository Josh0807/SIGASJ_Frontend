import type { ReactElement } from 'react'
import LoginPage from '../features/auth/pages/LoginPage'
import { PUBLIC_SERVICE_REQUEST_ROUTES } from '../features/landing/config/serviceRequestRoutes'
import LandingPage from '../features/landing/pages/LandingPage'
import PublicFormPlaceholder from './PublicFormPlaceholder'

export type PublicRouteDefinition = {
  path: string
  element: ReactElement
  label: string
}

export const PUBLIC_ROUTES: PublicRouteDefinition[] = [
  {
    path: '/',
    element: <LandingPage />,
    label: 'Landing Page pública de SIGASJ',
  },
  {
    path: '/reportar-averia',
    element: (
      <PublicFormPlaceholder label="Formulario público de reporte de averías" />
    ),
    label: 'Formulario público de reporte de averías',
  },
  ...PUBLIC_SERVICE_REQUEST_ROUTES.map(({ path, label }) => ({
    path,
    element: <PublicFormPlaceholder label={label} />,
    label,
  })),
  {
    path: '/login',
    element: <LoginPage />,
    label: 'Inicio de sesión',
  },
]

export const PUBLIC_ROUTE_PATHS = PUBLIC_ROUTES.map(({ path }) => path)
