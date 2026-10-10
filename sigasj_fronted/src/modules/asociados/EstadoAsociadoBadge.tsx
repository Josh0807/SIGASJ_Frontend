import { estadoLabel } from './asociadoForm'

export default function EstadoAsociadoBadge({ activo }: { activo: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold ${activo ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'}`}
    >
      <span className={`size-1.5 rounded-full ${activo ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden="true" />
      {estadoLabel(activo)}
    </span>
  )
}
