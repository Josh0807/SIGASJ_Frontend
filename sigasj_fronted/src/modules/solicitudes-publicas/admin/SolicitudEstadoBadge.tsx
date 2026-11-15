const styles: Record<string, string> = {
  PENDIENTE:
    'border-amber-300/80 bg-amber-50 text-amber-800',
  EN_REVISION:
    'border-violet-300/80 bg-violet-50 text-violet-800',
  APROBADA:
    'border-emerald-300/80 bg-emerald-50 text-emerald-800',
  RECHAZADA:
    'border-red-300/80 bg-red-50 text-red-800',
  FINALIZADA:
    'border-slate-300/80 bg-slate-100 text-slate-700',
  CANCELADA: 'border-slate-300 bg-slate-100 text-slate-700',
}

const dots: Record<string, string> = {
  PENDIENTE: 'bg-amber-500',
  EN_REVISION: 'bg-violet-500',
  APROBADA: 'bg-emerald-500',
  RECHAZADA: 'bg-red-500',
  FINALIZADA: 'bg-slate-500',
  CANCELADA: 'bg-slate-400',
}

const labels: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
}

type Props = {
  estado: string
  /** Compacto para timelines y filas densas. */
  size?: 'md' | 'sm'
}

export default function SolicitudEstadoBadge({ estado, size = 'md' }: Props) {
  const key = typeof estado === 'string' ? estado : String(estado ?? '')
  const compact = size === 'sm'
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border font-bold tracking-[0.01em] ${compact ? 'min-h-6 gap-1.5 px-2 py-0.5 text-[0.68rem]' : 'min-h-8 gap-2 px-3.5 py-1 text-xs font-extrabold shadow-[0_2px_7px_rgba(18,63,112,0.06)]'} ${styles[key] ?? styles.CANCELADA}`}
    >
      <span
        className={`rounded-full ${compact ? 'size-1.5' : 'size-2'} ${dots[key] ?? dots.CANCELADA}`}
        aria-hidden="true"
      />
      {labels[key] ?? (key.replaceAll('_', ' ') || 'Sin estado')}
    </span>
  )
}
