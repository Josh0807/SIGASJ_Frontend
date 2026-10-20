export const SERVICE_REQUEST_ROUTES = {
  paymentPlan: '/solicitudes/arreglo-pago',
  accountChange: '/solicitudes/cambio-titular',
  boundaryInfrastructure: '/solicitudes/infraestructura-linderos',
  affiliation: '/solicitudes/afiliacion',
  serviceAvailability: '/solicitudes/disponibilidad-servicios',
  existingService: '/solicitudes/servicio-existente',
} as const

export const OTHER_FORMS_ROUTE = '/solicitudes/otros-formularios'
export const REQUEST_TRACKING_ROUTE = '/solicitudes/seguimiento'

export const PUBLIC_SERVICE_REQUEST_ROUTES = [
  {
    path: SERVICE_REQUEST_ROUTES.paymentPlan,
    label: 'Formulario público de solicitud de arreglo de pago',
  },
  {
    path: SERVICE_REQUEST_ROUTES.accountChange,
    label: 'Formulario público de cambio de titular de servicio',
  },
  {
    path: SERVICE_REQUEST_ROUTES.boundaryInfrastructure,
    label: 'Formulario público de constancia de infraestructura frente a linderos',
  },
  {
    path: SERVICE_REQUEST_ROUTES.affiliation,
    label: 'Formulario público de afiliación',
  },
  {
    path: SERVICE_REQUEST_ROUTES.serviceAvailability,
    label: 'Formulario público de constancia de disponibilidad de servicios',
  },
  {
    path: SERVICE_REQUEST_ROUTES.existingService,
    label: 'Formulario público de constancia de servicio existente',
  },
] as const
