const ESTADO_LABELS: Record<string, string> = {
  REPORTADA: 'Reportada',
  EN_REVISION: 'En revisión',
  REQUIERE_CORRECCION: 'Requiere corrección',
  CORREGIDA: 'Corregida',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  REVISADA: 'Revisada',
}

export const formatActividadEstado = (estado: string): string =>
  ESTADO_LABELS[estado] ?? estado.replaceAll('_', ' ')
