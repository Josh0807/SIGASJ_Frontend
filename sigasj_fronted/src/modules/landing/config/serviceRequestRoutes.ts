export const SERVICE_REQUEST_ROUTES = {
  serviceRecord: '/solicitudes/constancia-servicio',
  affiliation: '/solicitudes/afiliacion',
  paymentPlan: '/solicitudes/arreglo-pago',
  accountChange: '/solicitudes/cambio-titular',
} as const

export const PUBLIC_SERVICE_REQUEST_ROUTES = [
  {
    path: SERVICE_REQUEST_ROUTES.serviceRecord,
    label: 'Formulario público de solicitud de constancia de servicio',
  },
  {
    path: SERVICE_REQUEST_ROUTES.affiliation,
    label: 'Formulario público de afiliación',
  },
  {
    path: SERVICE_REQUEST_ROUTES.paymentPlan,
    label: 'Formulario público de solicitud de arreglo de pago',
  },
  {
    path: SERVICE_REQUEST_ROUTES.accountChange,
    label: 'Formulario público de cambio de titular de servicio',
  },
] as const
