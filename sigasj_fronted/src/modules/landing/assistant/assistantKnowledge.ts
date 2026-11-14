export type AssistantReply = {
  text: string
  links?: { label: string; href: string }[]
}

export type AssistantTopic = {
  id: string
  keywords: string[]
  reply: AssistantReply
}

export const ASSISTANT_GREETING =
  'Hola, soy el asistente de SIGASJ. Puedo orientarle sobre recibos, pagos, averías, trámites y contacto de la ASADA San Juan.'

export const ASSISTANT_FALLBACK: AssistantReply = {
  text: 'No encontré una respuesta exacta. Puede consultar las secciones del sitio o escribirnos por WhatsApp al 8560-7584 / correo asadasanjuan24@gmail.com.',
  links: [
    { label: 'Ir a contacto', href: '#contacto' },
    { label: 'Accesos rápidos', href: '#accesos-rapidos' },
  ],
}

export const ASSISTANT_SUGGESTIONS = [
  '¿Cómo consulto mi recibo?',
  'Quiero reportar una avería',
  'Horario de atención',
  'Métodos de pago',
  'Trámites disponibles',
] as const

export const ASSISTANT_TOPICS: AssistantTopic[] = [
  {
    id: 'recibo',
    keywords: [
      'recibo',
      'factura',
      'consultar recibo',
      'ver recibo',
      'cuenta',
      'saldo',
      'pago pendiente',
    ],
    reply: {
      text: 'Puede consultar su recibo de agua en línea desde la sección Recibos y pagos. Solo necesita los datos de consulta que usa la ASADA.',
      links: [
        { label: 'Consultar recibo', href: '#pagos' },
        { label: 'Accesos rápidos', href: '#accesos-rapidos' },
      ],
    },
  },
  {
    id: 'pago',
    keywords: [
      'pagar',
      'pago',
      'sinpe',
      'banco',
      'transferencia',
      'ventanilla',
      'métodos de pago',
      'metodos de pago',
    ],
    reply: {
      text: 'Puede pagar por SINPE Móvil al 8560-7584 (confirme el comprobante por WhatsApp), por Banco Nacional (banca en línea, app o sucursales) o en la ventanilla de la ASADA.',
      links: [{ label: 'Ver métodos de pago', href: '#pagos' }],
    },
  },
  {
    id: 'averia',
    keywords: [
      'avería',
      'averia',
      'fuga',
      'daño',
      'dano',
      'roto',
      'sin agua',
      'reportar',
      'tubo',
      'tubería',
      'tuberia',
    ],
    reply: {
      text: 'Para reportar una fuga, daño o falla del servicio use el formulario de averías. También puede contactarnos al WhatsApp 8560-7584.',
      links: [
        { label: 'Reportar avería', href: '/reportar-averia' },
        { label: 'Contacto', href: '#contacto' },
      ],
    },
  },
  {
    id: 'tramites',
    keywords: [
      'trámite',
      'tramite',
      'solicitud',
      'formulario',
      'afiliación',
      'afiliacion',
      'constancia',
      'cambio de nombre',
      'arreglo de pago',
    ],
    reply: {
      text: 'En Solicitudes encontrará trámites como afiliación, constancias, cambio de nombre y arreglo de pago. También puede dar seguimiento con su código.',
      links: [
        { label: 'Ver trámites', href: '#solicitudes-servicio' },
        { label: 'Seguimiento', href: '#solicitudes-servicio' },
      ],
    },
  },
  {
    id: 'horario',
    keywords: [
      'horario',
      'abre',
      'abierto',
      'atienden',
      'atención',
      'atencion',
      'oficina',
      'cuándo',
      'cuando',
    ],
    reply: {
      text: 'El horario de atención de la ASADA San Juan es de lunes a sábado, de 7:00 a.m. a 11:30 a.m. (confirme en Contacto si hay cambios temporales).',
      links: [{ label: 'Ver contacto', href: '#contacto' }],
    },
  },
  {
    id: 'contacto',
    keywords: [
      'contacto',
      'teléfono',
      'telefono',
      'whatsapp',
      'correo',
      'email',
      'ubicación',
      'ubicacion',
      'dirección',
      'direccion',
      'mapa',
    ],
    reply: {
      text: 'WhatsApp/teléfono: 8560-7584. Correo: asadasanjuan24@gmail.com. La oficina está en San Juan de Santa Cruz; puede ver el mapa en Contacto.',
      links: [{ label: 'Ir a contacto', href: '#contacto' }],
    },
  },
  {
    id: 'comunicados',
    keywords: [
      'comunicado',
      'aviso',
      'corte',
      'mantenimiento',
      'interrupción',
      'interrupcion',
      'noticia',
    ],
    reply: {
      text: 'Los avisos oficiales de mantenimientos, cortes y asambleas se publican en Comunicados.',
      links: [{ label: 'Ver comunicados', href: '#comunicados' }],
    },
  },
  {
    id: 'transparencia',
    keywords: [
      'transparencia',
      'calidad del agua',
      'documento',
      'informe',
      'laboratorio',
    ],
    reply: {
      text: 'En Transparencia puede consultar documentos e información sobre la gestión del servicio y la calidad del agua.',
      links: [{ label: 'Ver transparencia', href: '#transparencia' }],
    },
  },
  {
    id: 'login',
    keywords: [
      'iniciar sesión',
      'iniciar sesion',
      'login',
      'entrar',
      'admin',
      'administrativo',
      'contraseña',
      'password',
    ],
    reply: {
      text: 'El acceso administrativo es solo para personal autorizado de la ASADA. Use Iniciar sesión en el menú superior.',
      links: [{ label: 'Ir a iniciar sesión', href: '/login' }],
    },
  },
  {
    id: 'saludo',
    keywords: ['hola', 'buenas', 'buenos días', 'buenos dias', 'buenas tardes', 'hey'],
    reply: {
      text: ASSISTANT_GREETING,
      links: [
        { label: 'Consultar recibo', href: '#pagos' },
        { label: 'Reportar avería', href: '/reportar-averia' },
      ],
    },
  },
  {
    id: 'gracias',
    keywords: ['gracias', 'muchas gracias', 'ok', 'perfecto', 'listo'],
    reply: {
      text: 'Con gusto. Si necesita algo más, escríbame aquí o contáctenos al 8560-7584.',
    },
  },
]
