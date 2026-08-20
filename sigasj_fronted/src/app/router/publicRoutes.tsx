import type { ReactElement } from 'react'
import LoginPage from '../../modules/auth/pages/LoginPage'
import UnauthorizedPage from '../../modules/auth/components/UnauthorizedPage'
import LandingPage from '../../modules/landing/pages/LandingPage'
import ReceiptQueryPage from '../../modules/recibos/pages/ReceiptQueryPage'
import { PUBLIC_SERVICE_REQUEST_ROUTES } from '../../modules/landing/config/serviceRequestRoutes'
import PublicFormPlaceholder from '../../shared/components/PublicFormPlaceholder'
import {
  LANDING_ROUTE_PATH,
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
  RECEIPT_QUERY_ROUTE_PATH,
} from './routePaths'

export type PublicRouteDefinition = {
  path: string
  element: ReactElement
  label: string
}

export { LANDING_ROUTE_PATH, LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH, RECEIPT_QUERY_ROUTE_PATH }

export const PUBLIC_ROUTES: PublicRouteDefinition[] = [
  {
    path: LANDING_ROUTE_PATH,
    element: <LandingPage />,
    label: 'Landing Page pública de SIGASJ',
  },
  {
    path: RECEIPT_QUERY_ROUTE_PATH,
    element: <ReceiptQueryPage />,
    label: 'Formulario de consulta de recibos',
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
    path: LOGIN_ROUTE_PATH,
    element: <LoginPage />,
    label: 'Inicio de sesión',
  },
  {
    path: UNAUTHORIZED_ROUTE_PATH,
    element: <UnauthorizedPage />,
    label: 'Acceso denegado',
  },
]

export const PUBLIC_ROUTE_PATHS = PUBLIC_ROUTES.map(({ path }) => path)

export const LANDING_ROUTE = PUBLIC_ROUTES.find(
  (route) => route.path === LANDING_ROUTE_PATH,
)

export const PUBLIC_VISITOR_FORM_ROUTES = PUBLIC_ROUTES.filter(
  (route) =>
    route.path !== LANDING_ROUTE_PATH &&
    route.path !== LOGIN_ROUTE_PATH &&
    route.path !== UNAUTHORIZED_ROUTE_PATH,
)


export const PUBLIC_VISITOR_FORM_PATHS = PUBLIC_VISITOR_FORM_ROUTES.map(
  ({ path }) => path,
)
