export const SERVICE_REQUEST_ROUTES = {
  paymentPlan: '/solicitudes/arreglo-pago',
  accountChange: '/solicitudes/cambio-titular',
  boundaryInfrastructure: '/solicitudes/infraestructura-linderos',
  affiliation: '/solicitudes/afiliacion',
  serviceAvailability: '/solicitudes/disponibilidad-servicios',
  existingService: '/solicitudes/servicio-existente',
} as const

export type ServiceRequestRouteKey = keyof typeof SERVICE_REQUEST_ROUTES

/**
 * Trámites con formulario digital ya cableado en `publicRoutes`.
 * El resto permanece disponible solo para descarga presencial.
 */
export const ONLINE_SERVICE_REQUEST_KEYS = [
  'paymentPlan',
  'accountChange',
  'boundaryInfrastructure',
  'affiliation',
  'serviceAvailability',
] as const satisfies readonly ServiceRequestRouteKey[]

export const ONLINE_SERVICE_REQUEST_PATHS = new Set<string>(
  ONLINE_SERVICE_REQUEST_KEYS.map((key) => SERVICE_REQUEST_ROUTES[key]),
)

export const isOnlineServiceRequestPath = (path: string) =>
  ONLINE_SERVICE_REQUEST_PATHS.has(path)

export const OTHER_FORMS_ROUTE = '/solicitudes/otros-formularios'
export const REQUEST_TRACKING_ROUTE = '/solicitudes/seguimiento'

/** Metadatos de todos los trámites (incluye solo-presencial). No implica ruta online. */
export const SERVICE_REQUEST_CATALOG = [
  {
    key: 'paymentPlan' as const,
    path: SERVICE_REQUEST_ROUTES.paymentPlan,
    label: 'Formulario público de solicitud de arreglo de pago',
  },
  {
    key: 'accountChange' as const,
    path: SERVICE_REQUEST_ROUTES.accountChange,
    label: 'Formulario público de cambio de titular del servicio',
  },
  {
    key: 'boundaryInfrastructure' as const,
    path: SERVICE_REQUEST_ROUTES.boundaryInfrastructure,
    label: 'Formulario público de constancia de infraestructura frente a linderos',
  },
  {
    key: 'affiliation' as const,
    path: SERVICE_REQUEST_ROUTES.affiliation,
    label: 'Formulario público de afiliación',
  },
  {
    key: 'serviceAvailability' as const,
    path: SERVICE_REQUEST_ROUTES.serviceAvailability,
    label: 'Formulario público de constancia de disponibilidad de servicios',
  },
  {
    key: 'existingService' as const,
    path: SERVICE_REQUEST_ROUTES.existingService,
    label: 'Formulario público de constancia de servicio existente',
  },
] as const

/** Solo trámites con formulario digital cableado: se registran en el router público. */
export const PUBLIC_ONLINE_SERVICE_REQUEST_ROUTES = SERVICE_REQUEST_CATALOG.filter(
  (item) =>
    (ONLINE_SERVICE_REQUEST_KEYS as readonly ServiceRequestRouteKey[]).includes(
      item.key,
    ),
).map(({ path, label }) => ({ path, label }))

/** @deprecated Preferir PUBLIC_ONLINE_SERVICE_REQUEST_ROUTES para el router. */
export const PUBLIC_SERVICE_REQUEST_ROUTES = PUBLIC_ONLINE_SERVICE_REQUEST_ROUTES
