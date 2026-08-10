import type { ReactElement } from 'react'
import LandingPage from '../LandingPage/components/LandingPage'
import LoginPage from '../auth/LoginPage'
import { PUBLIC_SERVICE_REQUEST_ROUTES } from '../LandingPage/config/serviceRequestRoutes'

export type PublicRouteDefinition = {
  path: string
  element: ReactElement
  label: string
}

const PublicFormPlaceholder = ({ label }: { label: string }) => (
  <main aria-label={label} />
)

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
