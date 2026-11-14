/**
 * Respuestas locales de orientación (Modo demostración).
 * No simulan consultas a base de datos ni acciones del sistema.
 */
export const buildSageDemoReply = (message: string, modulePath: string): string => {
  const q = message.trim().toLowerCase()
  const moduleLabel = modulePath.replace(/^\/admin\/?/, '') || 'panel'

  if (/expl[ií]ca|esta pantalla|qu[eé] veo|esta vista/i.test(q)) {
    return `Está en el módulo «${moduleLabel}». Use el menú lateral para cambiar de sección y el encabezado de cada pantalla para acciones principales (crear, filtrar o actualizar). En Modo demostración no consulto registros reales; solo oriento sobre la interfaz.`
  }

  if (/aver[ií]a/i.test(q)) {
    return 'Para gestionar averías abra el módulo Averías desde el menú. Allí puede listar reportes, filtrar por estado y abrir el detalle para asignar fontanero u observar el seguimiento. Sage no registra ni modifica averías por usted.'
  }

  if (/asociad|abonad|consult/i.test(q)) {
    return 'En Gestión de asociados use el buscador y los filtros de estado para localizar un registro; luego abra el detalle o el historial con los botones de la fila. No puedo consultar cédulas ni datos reales desde este chat.'
  }

  if (/entrada|inventario|bodega|stock/i.test(q)) {
    return 'En Inventario use las opciones de entradas/salidas o el catálogo según su rol. «Registrar entrada» suele estar en las acciones del módulo. Sage solo explica el flujo; no crea movimientos de inventario.'
  }

  if (/solicitud|tr[aá]mite/i.test(q)) {
    return 'En Gestión de solicitudes elija la subsección (trámites, formularios oficiales o descargables). En el listado puede abrir un expediente y cambiar su estado si su rol lo permite. No ejecuto cambios de estado desde el chat.'
  }

  if (/permiso|vacacion|rrhh|colaborador/i.test(q)) {
    return 'En Recursos humanos encontrará colaboradores, permisos, vacaciones e incapacidades. Use la subnavegación del módulo y respete las acciones visibles según su rol. Sage no altera permisos ni saldos.'
  }

  return `Puedo orientarlo sobre el uso del panel (ahora en «${moduleLabel}»). Pruebe una sugerencia o descríbame la tarea. Estoy en Modo demostración: no consulto la base de datos ni realizo cambios.`
}
