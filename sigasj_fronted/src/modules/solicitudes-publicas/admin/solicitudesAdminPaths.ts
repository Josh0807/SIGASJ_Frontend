export const SOLICITUDES_ADMIN_PATH = '/admin/solicitudes'
export const FORMULARIOS_OFICIALES_ADMIN_PATH = `${SOLICITUDES_ADMIN_PATH}/formularios-oficiales`
export const FORMULARIOS_DESCARGABLES_ADMIN_PATH = `${SOLICITUDES_ADMIN_PATH}/formularios-descargables`
export const SOLICITUDES_ADMIN_TRAMITES_PATH = `${SOLICITUDES_ADMIN_PATH}/tramites`

export const solicitudAdminDetailPath = (id: number | string) =>
  `${SOLICITUDES_ADMIN_PATH}/${id}`

/** Alias en español (listado local / trámites). */
export const solicitudAdminDetallePath = solicitudAdminDetailPath
