import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'

export default function AsociadoFeedback({ variant, children }: { variant: 'success' | 'error'; children: string }) {
  const success = variant === 'success'
  const Icon = success ? IconCircleCheck : IconAlertTriangle
  return <div className={`relative flex min-w-0 items-start gap-3 overflow-hidden rounded-2xl border px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.08)] sm:items-center sm:gap-4 sm:px-5 ${success ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-teal-50 text-emerald-950' : 'border-rose-200 bg-gradient-to-r from-rose-50 via-white to-orange-50 text-rose-950'}`} role={success ? 'status' : 'alert'}>
    <span className={`absolute inset-y-0 left-0 w-1.5 ${success ? 'bg-gradient-to-b from-emerald-500 to-teal-400' : 'bg-gradient-to-b from-rose-500 to-orange-400'}`} aria-hidden="true" />
    <span className={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 ${success ? 'bg-emerald-100 text-emerald-700 ring-emerald-200' : 'bg-rose-100 text-rose-700 ring-rose-200'}`}><Icon size={22} stroke={2.2} aria-hidden="true" /></span>
    <span className="min-w-0"><strong className="block text-sm font-black sm:text-base">{success ? 'Operación exitosa' : 'No se pudo completar la acción'}</strong><span className={`mt-0.5 block text-sm font-semibold leading-6 ${success ? 'text-emerald-800' : 'text-rose-800'}`}>{children}</span></span>
  </div>
}
