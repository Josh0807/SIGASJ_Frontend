export type SageSuggestion = {
  id: string
  label: string
}

const COMMON: SageSuggestion[] = [
  { id: 'explain', label: 'Explícame esta pantalla' },
]

const BY_SEGMENT: Record<string, SageSuggestion[]> = {
  dashboard: [
    { id: 'dash-kpi', label: '¿Qué significan estos indicadores?' },
    { id: 'dash-refresh', label: '¿Cómo actualizo los datos del panel?' },
  ],
  abonados: [
    { id: 'aso-consulta', label: '¿Cómo consulto un asociado?' },
    { id: 'aso-registro', label: '¿Cómo registro un asociado?' },
  ],
  asociados: [
    { id: 'aso-consulta', label: '¿Cómo consulto un asociado?' },
    { id: 'aso-registro', label: '¿Cómo registro un asociado?' },
  ],
  solicitudes: [
    { id: 'sol-estado', label: '¿Cómo cambio el estado de una solicitud?' },
    { id: 'sol-docs', label: '¿Dónde gestiono formularios oficiales?' },
  ],
  averias: [
    { id: 'ave-registro', label: '¿Cómo registro una avería?' },
    { id: 'ave-asignar', label: '¿Cómo asigno un fontanero?' },
  ],
  inventario: [
    { id: 'inv-entrada', label: '¿Cómo registro una entrada de inventario?' },
    { id: 'inv-alerta', label: '¿Dónde veo alertas de reposición?' },
  ],
  actividades: [
    { id: 'act-nueva', label: '¿Cómo registro una actividad?' },
    { id: 'act-revision', label: '¿Cómo reviso actividades pendientes?' },
  ],
  rrhh: [
    { id: 'rrhh-colab', label: '¿Cómo consulto un colaborador?' },
    { id: 'rrhh-permiso', label: '¿Cómo gestiono permisos o vacaciones?' },
  ],
  proyectos: [
    { id: 'proy-crear', label: '¿Cómo creo o edito un proyecto?' },
  ],
  galeria: [
    { id: 'gal-subir', label: '¿Cómo publico una fotografía?' },
  ],
  comunicados: [
    { id: 'com-nuevo', label: '¿Cómo publico un comunicado?' },
  ],
  contacto: [
    { id: 'con-edit', label: '¿Cómo actualizo datos de contacto?' },
  ],
  transparencia: [
    { id: 'tra-doc', label: '¿Cómo publico un documento?' },
  ],
  perfil: [
    { id: 'per-info', label: '¿Qué datos muestra mi perfil?' },
  ],
}

export const getSageSuggestionsForPath = (pathname: string): SageSuggestion[] => {
  const parts = pathname.split('/').filter(Boolean)
  const adminIndex = parts.indexOf('admin')
  const segment =
    adminIndex >= 0 && parts[adminIndex + 1] ? parts[adminIndex + 1] : parts[0] ?? ''
  const specific = BY_SEGMENT[segment] ?? [
    { id: 'nav', label: '¿Cómo me muevo entre módulos?' },
    { id: 'help', label: '¿Qué puedo hacer en este módulo?' },
  ]
  const merged = [...COMMON, ...specific]
  const seen = new Set<string>()
  return merged.filter((item) => {
    if (seen.has(item.label)) return false
    seen.add(item.label)
    return true
  }).slice(0, 4)
}

export const SAGE_GREETING = 'Hola, soy Sage. ¿En qué te ayudo?'
