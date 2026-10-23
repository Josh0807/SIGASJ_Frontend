import type { ReactElement } from 'react'
import LoginPage from '../../modules/auth/pages/LoginPage'
import UnauthorizedPage from '../../modules/auth/components/UnauthorizedPage'
import LandingPage from '../../modules/landing/pages/LandingPage'
import ReceiptQueryPage from '../../modules/recibos/pages/ReceiptQueryPage'
import {
  PUBLIC_ONLINE_SERVICE_REQUEST_ROUTES,
  SERVICE_REQUEST_ROUTES,
} from '../../modules/landing/config/serviceRequestRoutes'
import ComplaintFormPage from '../../modules/landing/pages/ComplaintFormPage'
import ReportarAveriaPage from '../../modules/averias/pages/ReportarAveriaPage'
import ProyectoPublicDetailPage from '../../modules/proyectos/public/ProyectoPublicDetailPage'
import OtherFormsPage from '../../modules/landing/pages/OtherFormsPage'
import RequestTrackingPage from '../../modules/landing/pages/RequestTrackingPage'
import AfiliacionPage from '../../modules/solicitudes-publicas/afiliacion/AfiliacionPage'
import ArregloPagoPage from '../../modules/solicitudes-publicas/arreglo-pago/ArregloPagoPage'
import CambioTitularPage from '../../modules/solicitudes-publicas/cambio-titular/CambioTitularPage'
import DisponibilidadPage from '../../modules/solicitudes-publicas/disponibilidad-servicios/DisponibilidadPage'
import InfraestructuraLinderosPage from '../../modules/solicitudes-publicas/infraestructura-linderos/InfraestructuraLinderosPage'

import {
  LANDING_ROUTE_PATH,
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
  RECEIPT_QUERY_ROUTE_PATH,
  REPORTAR_AVERIA_ROUTE_PATH,
  PROYECTO_DETAIL_PUBLIC_ROUTE_PATH,
  OTHER_FORMS_ROUTE_PATH,
  REQUEST_TRACKING_ROUTE_PATH,
} from './routePaths'

export type PublicRouteDefinition = {
  path: string
  element: ReactElement
  label: string
}

export {
  LANDING_ROUTE_PATH,
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
  RECEIPT_QUERY_ROUTE_PATH,
  REPORTAR_AVERIA_ROUTE_PATH,
  PROYECTO_DETAIL_PUBLIC_ROUTE_PATH,
  OTHER_FORMS_ROUTE_PATH,
  REQUEST_TRACKING_ROUTE_PATH,
}

export const PUBLIC_ROUTES: PublicRouteDefinition[] = [
  {
    path: LANDING_ROUTE_PATH,
    element: <LandingPage />,
    label: 'Landing Page pública de SIGASJ',
  },
  {
    path: PROYECTO_DETAIL_PUBLIC_ROUTE_PATH,
    element: <ProyectoPublicDetailPage />,
    label: 'Detalle público de proyecto de la ASADA',
  },
  {
    path: RECEIPT_QUERY_ROUTE_PATH,
    element: <ReceiptQueryPage />,
    label: 'Consulta pública de recibos',
  },

  {
    path: '/formulario-quejas',
    element: <ComplaintFormPage />,
    label: 'Formulario público de sugerencias y quejas',
  },
  {
    path: REPORTAR_AVERIA_ROUTE_PATH,
    element: <ReportarAveriaPage />,
    label: 'Formulario público de reporte de averías',
  },
  {
    path: OTHER_FORMS_ROUTE_PATH,
    element: <OtherFormsPage />,
    label: 'Otros formularios descargables',
  },
  {
    path: REQUEST_TRACKING_ROUTE_PATH,
    element: <RequestTrackingPage />,
    label: 'Seguimiento público de solicitudes',
  },
  ...PUBLIC_ONLINE_SERVICE_REQUEST_ROUTES.map(({ path, label }) => ({
    path,
    element:
      path === SERVICE_REQUEST_ROUTES.paymentPlan ? (
        <ArregloPagoPage />
      ) : path === SERVICE_REQUEST_ROUTES.accountChange ? (
        <CambioTitularPage />
      ) : path === SERVICE_REQUEST_ROUTES.boundaryInfrastructure ? (
        <InfraestructuraLinderosPage />
      ) : path === SERVICE_REQUEST_ROUTES.serviceAvailability ? (
        <DisponibilidadPage />
      ) : (
        <AfiliacionPage />
      ),
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
    route.path !== UNAUTHORIZED_ROUTE_PATH &&
    route.path !== PROYECTO_DETAIL_PUBLIC_ROUTE_PATH,
)



export const PUBLIC_VISITOR_FORM_PATHS = PUBLIC_VISITOR_FORM_ROUTES.map(
  ({ path }) => path,
)
