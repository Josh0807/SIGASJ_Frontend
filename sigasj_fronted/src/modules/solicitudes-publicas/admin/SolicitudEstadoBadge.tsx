const styles: Record<string, string> = {
  PENDIENTE: 'border-amber-300/80 bg-amber-50 text-amber-800 shadow-[0_2px_7px_rgba(217,119,6,0.08)]',
  EN_REVISION: 'border-blue-300/80 bg-blue-50 text-blue-800 shadow-[0_2px_7px_rgba(37,99,235,0.08)]',
  APROBADA: 'border-emerald-300/80 bg-emerald-50 text-emerald-800 shadow-[0_2px_7px_rgba(5,150,105,0.08)]',
  RECHAZADA: 'border-red-300/80 bg-red-50 text-red-800 shadow-[0_2px_7px_rgba(220,38,38,0.08)]',
  FINALIZADA: 'border-violet-300/80 bg-violet-50 text-violet-800 shadow-[0_2px_7px_rgba(124,58,237,0.08)]',
  CANCELADA: 'border-slate-300 bg-slate-100 text-slate-700',
}

const labels: Record<string, string> = {
  PENDIENTE: 'Pendiente', EN_REVISION: 'En revisión', APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada', FINALIZADA: 'Finalizada', CANCELADA: 'Cancelada',
}

export default function SolicitudEstadoBadge({ estado }: { estado: string }) {
  return <span className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full border px-3.5 py-1 text-xs font-black tracking-[0.01em] ${styles[estado] ?? styles.CANCELADA}`}>{labels[estado] ?? estado.replaceAll('_', ' ')}</span>
}
