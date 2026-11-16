/**
 * Respuestas locales de orientación (Modo demostración).
 * No simulan consultas a base de datos ni acciones del sistema.
 */

type DemoRule = {
  id: string
  test: RegExp
  reply: (moduleLabel: string) => string
}

const moduleName = (modulePath: string) => {
  const cleaned = modulePath.replace(/^\/admin\/?/, '').replace(/\/+$/, '')
  if (!cleaned) return 'inicio del panel'
  const segment = cleaned.split('/')[0] ?? cleaned
  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    abonados: 'Gestión de asociados',
    asociados: 'Gestión de asociados',
    solicitudes: 'Gestión de solicitudes',
    averias: 'Gestión de averías',
    inventario: 'Gestión de inventario',
    actividades: 'Actividades del fontanero',
    rrhh: 'Recursos humanos',
    proyectos: 'Gestión de proyectos',
    galeria: 'Galería de fotografías',
    comunicados: 'Gestión de comunicados',
    contacto: 'Contacto',
    transparencia: 'Transparencia',
    perfil: 'Mi perfil',
    'mapa-red': 'Mapa de la red',
  }
  return labels[segment] ?? cleaned
}

const RULES: DemoRule[] = [
  {
    id: 'pantalla',
    test: /expl[ií]ca|esta pantalla|qu[eé] veo|esta vista|m[oó]dulo actual|estoy aqu[ií]/i,
    reply: (moduleLabel) =>
      `Está en «${moduleLabel}».\n\n• Menú izquierdo: cambie de módulo.\n• Encabezado: acciones principales (crear, filtrar, historial).\n• Listados: use «Ver detalle» para abrir un registro.\n\nEn Modo demostración solo oriento la interfaz; no consulto datos reales.`,
  },
  {
    id: 'navegar',
    test: /naveg|men[uú]|m[oó]dulo|moverme|cambiar de secci[oó]n|c[oó]mo me muevo/i,
    reply: () =>
      'Use el menú lateral izquierdo para saltar entre módulos (Dashboard, Asociados, Inventario, Averías, etc.). El módulo activo queda resaltado. En pantallas con subsecciones (Solicitudes, RRHH) verá opciones adicionales bajo el título.',
  },
  {
    id: 'averia-asignar',
    test: /asign.*(fontaner|t[eé]cnic)|fontaner.*asign/i,
    reply: () =>
      'Para asignar un fontanero:\n1. Abra Gestión de averías.\n2. Filtre o busque el reporte y entre a «Ver detalle».\n3. En el detalle use la sección de asignación / gestión para elegir el fontanero disponible.\n4. Guarde el cambio. El estado avanzará según el flujo de su rol.\n\nSage no asigna por usted; solo indica el camino.',
  },
  {
    id: 'averia-registrar',
    test: /registr.*aver[ií]a|reportar aver[ií]a|nueva aver[ií]a|c[oó]mo.*(aver[ií]a)/i,
    reply: () =>
      'Las averías suelen ingresar desde el reporte público o el módulo Averías.\n\nEn el panel admin:\n1. Vaya a Gestión de averías.\n2. Revise el listado (código AV-…, estado, prioridad).\n3. Abra el detalle para clasificar tipo, prioridad y seguimiento.\n\nNo creo reportes desde este chat.',
  },
  {
    id: 'averias',
    test: /aver[ií]a|fuga|tuber[ií]a|mapa.?red|recibida/i,
    reply: () =>
      'En Gestión de averías puede:\n• Filtrar por estado, prioridad y fechas.\n• Abrir cada código (AV-…) con «Ver detalle».\n• Asignar fontanero, marcar prioridad y dar seguimiento.\n• Usar Historial o Resumen desde el encabezado.\n\nSage no modifica averías ni consulta registros reales en demostración.',
  },
  {
    id: 'asociado-registro',
    test: /registr.*asociad|nuevo asociad|alta.*abonad|c[oó]mo registro un asociad/i,
    reply: () =>
      'En Gestión de asociados use la acción de registro o alta visible en el encabezado (según su rol). Complete los datos solicitados y guarde. Luego podrá localizarlo con el buscador del listado.',
  },
  {
    id: 'asociados',
    test: /asociad|abonad|consult.*c[eé]dul/i,
    reply: () =>
      'En Gestión de asociados:\n• Busque por nombre o filtros de estado.\n• Abra el detalle o el historial desde la fila.\n• Edite solo si su rol muestra esas acciones.\n\nNo puedo consultar cédulas ni datos reales desde el chat.',
  },
  {
    id: 'inventario-alerta',
    test: /alerta.*reposici[oó]n|reposici[oó]n|stock bajo|faltante/i,
    reply: () =>
      'En Inventario abra la sección de alertas o reposición (según el menú del módulo). Allí verá materiales con stock bajo y podrá dar seguimiento a la gestión. Sage no crea órdenes de compra.',
  },
  {
    id: 'inventario-entrada',
    test: /entrada.*inventario|registrar entrada|ingreso.*bodega/i,
    reply: () =>
      'Para registrar una entrada:\n1. Abra Gestión de inventario.\n2. Elija Entradas (o la acción «Registrar entrada»).\n3. Indique material, cantidad y confirme.\n\nLas salidas y movimientos quedan en el historial del módulo. Sage no crea movimientos.',
  },
  {
    id: 'inventario',
    test: /inventario|bodega|stock|material|kardex|movimiento/i,
    reply: () =>
      'Inventario concentra catálogo, entradas, salidas, alertas y movimientos. Use el menú interno del módulo y respete las acciones visibles para su rol. Sage solo explica el flujo; no altera existencias.',
  },
  {
    id: 'solicitudes',
    test: /solicitud|tr[aá]mite|formulario oficial|descargable/i,
    reply: () =>
      'En Gestión de solicitudes elija la subsección (trámites, formularios oficiales o descargables). En el listado abra el expediente y cambie el estado solo si su rol lo permite. Sage no cambia estados desde el chat.',
  },
  {
    id: 'actividades',
    test: /actividad|fontaner|evidencia|parte de trabajo/i,
    reply: () =>
      'En Actividades del fontanero puede registrar trabajos, adjuntar evidencias y revisar pendientes. Use «Nueva actividad» o el listado de revisión según la pantalla. Sage no registra actividades por usted.',
  },
  {
    id: 'rrhh',
    test: /permiso|vacacion|incapacidad|rrhh|colaborador|recurso humano/i,
    reply: () =>
      'En Recursos humanos encontrará colaboradores, permisos, vacaciones e incapacidades. Use la subnavegación del módulo. Sage no altera permisos ni saldos.',
  },
  {
    id: 'proyectos',
    test: /proyecto|galer[ií]a del proyecto|fotograf[ií]a.*obra|portada/i,
    reply: () =>
      'En Gestión de proyectos puede crear o editar obras, ver el detalle y administrar la galería (agregar fotos, reordenar arrastrando y retirar). La imagen principal se gestiona en el mismo detalle. Sage no sube archivos por usted.',
  },
  {
    id: 'galeria',
    test: /galer[ií]a|fotograf[ií]a|publicar.*foto|imagen/i,
    reply: () =>
      'En Galería de fotografías administre álbumes o fotos públicas del sitio. Use las acciones de agregar/publicar del encabezado. Para fotos de una obra concreta, use la galería dentro del proyecto.',
  },
  {
    id: 'comunicados',
    test: /comunicad|anuncio|publicaci[oó]n/i,
    reply: () =>
      'En Gestión de comunicados cree o edite avisos para la comunidad. Revise título, vigencia y visibilidad antes de publicar. Sage no publica comunicados desde el chat.',
  },
  {
    id: 'dashboard',
    test: /dashboard|indicador|kpi|panel principal|actualizar.*datos/i,
    reply: () =>
      'El Dashboard resume indicadores del sistema. Cada tarjeta apunta a un área operativa. Si los datos no se ven al día, use actualizar/recargar de la pantalla o vuelva a entrar al módulo. Sage no recalcula métricas.',
  },
  {
    id: 'perfil',
    test: /perfil|mi cuenta|contrase[nñ]a|sesi[oó]n/i,
    reply: () =>
      'En Mi perfil verá la información de su cuenta y opciones disponibles según la configuración. No solicite ni escriba contraseñas en este chat.',
  },
  {
    id: 'roles',
    test: /rol|permiso de usuario|no puedo ver|no me aparece|autoriz/i,
    reply: () =>
      'Lo que ve en el menú y en cada pantalla depende de su rol (administradora, secretaria, fontanero, etc.). Si falta una acción, es probable que no esté habilitada para su usuario. Consulte a quien administra cuentas SIGASJ.',
  },
  {
    id: 'ayuda',
    test: /ayuda|qu[eé] puedes|qu[eé] puedes hacer|para qu[eé] sirves|hola|buenas/i,
    reply: (moduleLabel) =>
      `Puedo orientarlo sobre el uso del panel SIGASJ (ahora en «${moduleLabel}»).\n\nPregúnteme cómo registrar, filtrar, asignar o navegar en Averías, Asociados, Inventario, Solicitudes, RRHH, Proyectos y más.\n\nNo consulto la base de datos ni realizo cambios; solo guío la interfaz.`,
  },
]

export const buildSageDemoReply = (message: string, modulePath: string): string => {
  const q = message.trim()
  const moduleLabel = moduleName(modulePath)

  if (!q) {
    return `¿Sobre qué parte de «${moduleLabel}» necesita orientación? Puede usar una sugerencia o describir la tarea.`
  }

  for (const rule of RULES) {
    if (rule.test.test(q)) {
      return rule.reply(moduleLabel)
    }
  }

  const pathHints: Record<string, string> = {
    averias:
      'En esta pantalla revise filtros, códigos AV-… y «Ver detalle» para asignar o dar seguimiento.',
    inventario:
      'Desde aquí puede ir a entradas, salidas, alertas o el catálogo según las opciones del módulo.',
    asociados:
      'Use el buscador y los filtros; luego abra el detalle del asociado que necesite.',
    abonados:
      'Use el buscador y los filtros; luego abra el detalle del asociado que necesite.',
    solicitudes:
      'Elija la subsección adecuada y abra el expediente para ver o cambiar su estado.',
    rrhh: 'Use la subnavegación (colaboradores, permisos, vacaciones, incapacidades).',
    proyectos:
      'Abra un proyecto para editar datos, portada y galería de avance de obra.',
    actividades:
      'Registre o revise actividades del fontanero y sus evidencias desde el listado.',
    dashboard:
      'Las tarjetas resumen el estado operativo; entre al módulo relacionado para actuar.',
  }

  const segment =
    modulePath.replace(/^\/admin\/?/, '').split('/').filter(Boolean)[0] ?? ''
  const hint = pathHints[segment]

  return [
    `Entendí su consulta sobre el panel (módulo «${moduleLabel}»).`,
    hint ??
      'Revise el encabezado de la pantalla y el menú lateral: ahí están las acciones y atajos del módulo.',
    'Si concreta la tarea (por ejemplo: «cómo asigno un fontanero» o «dónde registro una entrada»), le indico los pasos.',
    'Estoy en Modo demostración: no consulto registros ni ejecuto cambios.',
  ].join('\n\n')
}
