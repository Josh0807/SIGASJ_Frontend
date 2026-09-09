export type ActivityFeedbackVariant = 'success' | 'error' | 'warning' | 'info'

export const ACTIVITY_FEEDBACK_MESSAGES = {
  successRegister: 'Actividad registrada correctamente.',
  successCorrect: 'La información fue actualizada correctamente.',
  successResend: 'Actividad reenviada correctamente.',
  successReview: 'La actividad fue marcada como revisada.',
  successCorrectionRequest:
    'Se solicitó la corrección de la actividad correctamente.',
  successDocument: 'Documento adjuntado correctamente.',
  validationReview: 'Revise los campos indicados antes de continuar.',
  forbidden: 'No tiene permisos para realizar esta acción.',
  unauthorized:
    'Su sesión no es válida o ha vencido. Vuelva a iniciar sesión para continuar.',
  notFound: 'La actividad solicitada no fue encontrada.',
  server:
    'No fue posible completar la operación. Intente nuevamente.',
  network:
    'No fue posible conectarse con el servidor. Verifique su conexión e intente nuevamente.',
  loadGeneric: 'No se pudo cargar la información. Intente nuevamente.',
  loadCorrections:
    'No se pudo cargar el indicador de correcciones.',
} as const
