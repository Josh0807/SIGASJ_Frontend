export const MENSAJE_PENDIENTE_HORARIO_FONTANERO =
  'La avería se encuentra asignada, pero todavía no puede iniciarse la atención debido al horario laboral.'

export const MENSAJE_PENDIENTE_ATENCION_ADMIN =
  'La avería ya tiene un Fontanero responsable, pero la atención todavía no ha comenzado.'

export const MENSAJE_INICIO_ATENCION_FUERA_DE_HORARIO =
  'La atención no puede iniciarse en este momento porque se encuentra fuera del horario laboral establecido.'

export const MENSAJE_ATENCION_NO_INICIADA =
  'La atención todavía no ha comenzado.'

export function esPendienteDeAtencion(estado: string): boolean {
  return estado === 'PENDIENTE' || estado === 'PENDIENTE_ATENCION'
}

export function esAsignada(estado: string): boolean {
  return estado === 'ASIGNADA'
}

export function esEnAtencion(estado: string): boolean {
  return estado === 'EN_ATENCION'
}

export function puedeIntentarIniciarAtencion(estado: string): boolean {
  return esAsignada(estado) || esPendienteDeAtencion(estado)
}

export function mostrarAvisoHorarioFontanero(estado: string): boolean {
  return esPendienteDeAtencion(estado)
}

export function mostrarAvisoPendienteAdmin(
  estado: string,
  tieneFontanero: boolean,
): boolean {
  return tieneFontanero && esPendienteDeAtencion(estado)
}

export function parseInicioAtencionError(
  error: unknown,
  fallback: string,
): string {
  if (!(error instanceof Error) || !error.message.trim()) {
    return fallback
  }

  const raw = error.message
  if (/TypeORM|SQL Server|ECONN|stack|QueryFailed/i.test(raw)) {
    return fallback
  }

  if (
    raw.includes('fuera del horario laboral') ||
    raw.includes('horario laboral establecido')
  ) {
    return MENSAJE_INICIO_ATENCION_FUERA_DE_HORARIO
  }

  const match = /^HTTP \d+:\s*([\s\S]*)$/.exec(raw)
  const detail = match?.[1]?.trim()
  if (!detail) {
    return fallback
  }

  if (/TypeORM|SQL Server|ECONN|stack|QueryFailed/i.test(detail)) {
    return fallback
  }

  if (
    detail.includes('fuera del horario laboral') ||
    detail.includes('horario laboral establecido')
  ) {
    return MENSAJE_INICIO_ATENCION_FUERA_DE_HORARIO
  }

  return detail.length > 200 ? fallback : detail
}
