import { IconAlertCircle, IconArrowLeft, IconCalendar, IconClipboardText, IconFileDescription, IconHistory, IconMessage2, IconRefresh } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatearFechaHoraAsada } from '../../../shared/utils/fechaAsada'
import SolicitudEstadoBadge from './SolicitudEstadoBadge'
import SolicitudDocumentoActions from './SolicitudDocumentoActions'
import { getSolicitudAdminDetail, solicitudesAdminError } from './solicitudesAdminApi'
import { SOLICITUDES_ADMIN_PATH } from './solicitudesAdminPaths'
import { presentSolicitudForm } from './solicitudFormPresentation'
import type { SolicitudAdminDetail } from './types'
import { useSolicitudesAdminSecurity } from './useSolicitudesAdminSecurity'

const formatBytes = (bytes?: number) => {
  if (bytes == null) return 'Tamaño no indicado'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const labelFor = (key: string) => key
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replaceAll('_', ' ')
  .replace(/^./, (letter) => letter.toUpperCase())

const displayValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return 'No indicado'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default function SolicitudAdminDetailPage() {
  const { id } = useParams()
  const numericId = Number(id)
  const invalidId = !Number.isInteger(numericId) || numericId <= 0
  const [detail, setDetail] = useState<SolicitudAdminDetail | null>(null)
  const [error, setError] = useState(invalidId ? 'El identificador de la solicitud no es válido.' : '')
  const [loading, setLoading] = useState(!invalidId)
  const [refresh, setRefresh] = useState(0)
  const handleSecurityError = useSolicitudesAdminSecurity()

  useEffect(() => {
    if (invalidId) return
    const controller = new AbortController()
    getSolicitudAdminDetail(numericId, controller.signal).then((response) => {
      if (!controller.signal.aborted) setDetail(response)
    }).catch((caught: unknown) => {
      if (controller.signal.aborted || handleSecurityError(caught)) return
      setError(solicitudesAdminError(caught, 'No fue posible cargar el detalle.'))
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [numericId, invalidId, refresh, handleSecurityError])

  if (loading) return <main className="admin-content-modern grid min-h-80 place-items-center" role="status"><span className="font-bold text-[#315d87]"><span className="mx-auto mb-3 block size-10 animate-spin rounded-full border-4 border-sky-100 border-t-blue-600" />Cargando detalle…</span></main>

  if (error || !detail) return <main className="admin-content-modern grid min-h-80 place-items-center"><section className="max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm" role="alert"><IconAlertCircle className="mx-auto text-red-600" size={42} /><h1 className="mb-0 mt-3 text-2xl font-black text-red-900">No se pudo abrir la solicitud</h1><p className="mb-0 mt-3 text-red-800">{error}</p><div className="mt-5 flex flex-wrap justify-center gap-3"><Link className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 font-bold text-slate-700 no-underline" to={SOLICITUDES_ADMIN_PATH}><IconArrowLeft size={18} /> Volver</Link><button className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-0 bg-red-700 px-4 font-bold text-white" onClick={() => { setLoading(true); setError(''); setRefresh((value) => value + 1) }}><IconRefresh size={18} /> Reintentar</button></div></section></main>

  const formEntries = presentSolicitudForm(detail.tipoSolicitud?.slug, detail.detalleFormulario)
  const adminEntries = Object.entries(detail.camposAdministrativos ?? {})

  return (
    <main className="admin-content-modern grid min-w-0 gap-5 sm:gap-6 [&>section]:!rounded-[26px] [&>section]:!p-7 [&>section]:!shadow-[0_12px_32px_rgba(30,90,156,0.08)] [&>div>aside]:!rounded-[26px] [&>div>aside]:!p-7 [&>div>aside]:!shadow-[0_12px_32px_rgba(30,90,156,0.08)] [&>div>section]:!rounded-[26px] [&>div>section]:!p-7 [&>div>section]:!shadow-[0_12px_32px_rgba(30,90,156,0.08)] [&_h2]:tracking-[-0.02em]">
      <Link className="group inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 font-extrabold text-[#075fae] no-underline shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 motion-reduce:transform-none" to={SOLICITUDES_ADMIN_PATH}><IconArrowLeft className="transition-transform group-hover:-translate-x-0.5 motion-reduce:transform-none" size={18} /> Volver a solicitudes</Link>
      <header className="relative isolate overflow-hidden rounded-[30px] border border-sky-100 bg-[radial-gradient(circle_at_92%_10%,rgba(125,211,252,0.22),transparent_28%),linear-gradient(135deg,#ffffff_0%,#f8fcff_58%,#eff8ff_100%)] p-6 shadow-[0_18px_45px_rgba(30,90,156,0.11)] sm:p-8 lg:p-10"><span className="pointer-events-none absolute -right-12 -top-16 -z-10 size-56 rounded-full border-[34px] border-sky-100/50" aria-hidden="true" /><div className="flex flex-wrap items-start justify-between gap-6"><div className="min-w-0"><p className="mb-3 mt-0 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-600"><span className="size-2 rounded-full bg-blue-500 shadow-[0_0_0_5px_rgba(59,130,246,0.12)]" /> Detalle administrativo</p><h1 className="m-0 break-all text-[clamp(2rem,5vw,3rem)] font-black leading-none tracking-[-0.04em] text-[#052f66]">{detail.codigoSeguimiento}</h1><p className="mb-0 mt-4 text-lg font-bold leading-7 text-[#315d87] sm:text-xl">{detail.tipoSolicitud?.nombre ?? detail.tipoSolicitud?.slug ?? 'Solicitud'}</p></div><div className="rounded-full bg-white p-1 shadow-[0_6px_18px_rgba(30,90,156,0.10)]"><SolicitudEstadoBadge estado={detail.estado} /></div></div><dl className="mt-8 grid gap-3 border-t border-sky-100 pt-6 sm:grid-cols-3"><div className="flex gap-3 rounded-2xl border border-white bg-white/70 p-4 shadow-sm"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><IconCalendar size={20} /></span><span><dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Fecha de ingreso</dt><dd className="m-0 mt-1 font-bold text-[#173f6e]">{formatearFechaHoraAsada(detail.fechaIngreso)}</dd></span></div><div className="flex gap-3 rounded-2xl border border-white bg-white/70 p-4 shadow-sm"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600"><IconClipboardText size={20} /></span><span><dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Fecha de resolución</dt><dd className="m-0 mt-1 font-bold text-[#173f6e]">{detail.fechaResolucion ? formatearFechaHoraAsada(detail.fechaResolucion) : 'Pendiente'}</dd></span></div><div className="flex gap-3 rounded-2xl border border-white bg-white/70 p-4 shadow-sm"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><IconMessage2 size={20} /></span><span><dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Observaciones</dt><dd className="m-0 mt-1 font-bold text-[#173f6e]">{detail.observaciones || 'Sin observaciones'}</dd></span></div></dl></header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="form-data-title"><h2 className="m-0 text-xl font-black text-[#073b79]" id="form-data-title">Datos originales del formulario</h2>{formEntries.length ? <dl className="mt-5 grid gap-x-7 gap-y-5 sm:grid-cols-2">{formEntries.map(({ key, label, value }) => <div className="min-w-0 border-b border-slate-100 pb-3" key={key}><dt className="text-sm font-bold text-slate-500">{label}</dt><dd className="m-0 mt-1 break-words font-semibold text-[#173f6e]">{typeof value === 'string' && value.startsWith('data:image/') ? <img className="max-h-28 max-w-full rounded-lg border bg-white p-2 object-contain" src={value} alt={label} /> : displayValue(value)}</dd></div>)}</dl> : <p className="mb-0 mt-4 text-slate-500">No hay datos específicos disponibles.</p>}</section>
        <aside className="rounded-3xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-5 shadow-sm sm:p-6" aria-labelledby="admin-summary-title"><h2 className="m-0 text-xl font-black text-[#073b79]" id="admin-summary-title">Resumen administrativo</h2>{adminEntries.length ? <dl className="mt-5 grid gap-4">{adminEntries.map(([key, value]) => <div key={key}><dt className="text-sm font-bold text-slate-500">{labelFor(key)}</dt><dd className="m-0 mt-1 break-words font-extrabold text-[#173f6e]">{displayValue(value)}</dd></div>)}</dl> : <p className="mb-0 mt-4 text-slate-500">Sin campos administrativos registrados.</p>}</aside>
      </div>

      <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="documents-title"><h2 className="m-0 flex items-center gap-2 text-xl font-black text-[#073b79]" id="documents-title"><IconFileDescription size={23} /> Documentos adjuntos <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs text-blue-800">{detail.documentos?.length ?? 0}</span></h2>{detail.documentos?.length ? <ul className="mb-0 mt-5 grid list-none gap-3 p-0 md:grid-cols-2">{detail.documentos.map((document) => <li className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4" key={document.id}><div className="flex min-w-0 items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-blue-600"><IconFileDescription size={23} /></span><span className="min-w-0"><strong className="block truncate text-[#173f6e]" title={document.nombreOriginal}>{document.nombreOriginal}</strong><small className="text-slate-500">{document.tipoDocumento} · {formatBytes(document.tamano ?? document.tamanio)}{document.mimeType ? ` · ${document.mimeType}` : ''}</small></span></div><SolicitudDocumentoActions solicitudId={detail.id} document={document} /></li>)}</ul> : <p className="mb-0 mt-4 text-slate-500">Esta solicitud no tiene documentos adjuntos.</p>}</section>

      <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="history-title"><h2 className="m-0 flex items-center gap-2 text-xl font-black text-[#073b79]" id="history-title"><IconHistory size={23} /> Historial de auditoría</h2>{detail.historial?.length ? <ol className="mb-0 mt-6 grid list-none gap-0 p-0">{detail.historial.map((event, index) => <li className="relative grid grid-cols-[18px_1fr] gap-4 pb-6 last:pb-0" key={event.id}><span className="relative z-10 mt-1 size-4 rounded-full border-4 border-blue-100 bg-blue-600" />{index < detail.historial.length - 1 ? <span className="absolute left-[7px] top-5 h-full w-0.5 bg-blue-100" /> : null}<div><div className="flex flex-wrap items-center gap-2"><SolicitudEstadoBadge estado={event.estadoNuevo} />{event.estadoAnterior ? <span className="text-sm text-slate-500">desde {event.estadoAnterior.replaceAll('_', ' ')}</span> : null}</div><p className="mb-0 mt-2 font-semibold text-[#173f6e]">{event.comentario || 'Cambio de estado registrado'}</p><p className="mb-0 mt-1 text-sm text-slate-500">{formatearFechaHoraAsada(event.fecha ?? event.fechaHora ?? '')}{event.usuarioId ? ` · Usuario #${event.usuarioId}` : ' · Evento del sistema'}</p></div></li>)}</ol> : <p className="mb-0 mt-4 text-slate-500">No hay eventos de historial disponibles.</p>}</section>
    </main>
  )
}
