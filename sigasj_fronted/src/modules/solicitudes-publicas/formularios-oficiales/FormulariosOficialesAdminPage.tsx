import { IconCircleCheckFilled, IconFileDescription, IconRefresh, IconUpload, IconX } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import { formatearFechaHoraAsada } from '../../../shared/utils/fechaAsada'
import FormularioOficialUploadDialog from './FormularioOficialUploadDialog'
import { getFormulariosOficialesAdmin, uploadFormularioOficial } from './formulariosOficialesApi'
import type { FormularioOficial } from './types'

const toAdminError = (error: unknown) => {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('HTTP 401')) return 'Tu sesión expiró. Inicia sesión nuevamente.'
  if (message.includes('HTTP 403')) return 'No tienes permisos para administrar formularios oficiales.'
  return 'No fue posible completar la operación. Intenta nuevamente.'
}

const FormulariosOficialesAdminPage = () => {
  const [items, setItems] = useState<FormularioOficial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selected, setSelected] = useState<FormularioOficial | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const load = useCallback(async () => { setLoading(true); setError(null); try { setItems(await getFormulariosOficialesAdmin()) } catch (caught) { setError(toAdminError(caught)) } finally { setLoading(false) } }, [])
  useEffect(() => runAfterEffect(() => { void load() }), [load])

  const save = async (file: File) => {
    if (!selected || submittingRef.current) return
    submittingRef.current = true; setSubmitting(true); setError(null); setSuccess(null)
    try {
      const updated = await uploadFormularioOficial(selected.tipoSolicitudId, file)
      setItems((current) => current.map((item) => item.tipoSolicitudId === updated.tipoSolicitudId ? updated : item))
      setSelected(null); setSuccess('El PDF oficial se guardó correctamente.')
    } catch (caught) { setError(toAdminError(caught)) } finally { submittingRef.current = false; setSubmitting(false) }
  }

  return (
    <main className="admin-content-modern min-w-0"><div className="mx-auto grid w-full max-w-[1180px] gap-6">
      <header className="flex min-h-[220px] flex-wrap items-center justify-between gap-6 rounded-[24px] border border-sky-100 bg-white p-8 shadow-[0_12px_32px_rgba(39,112,166,0.08)] max-[640px]:min-h-0 max-[640px]:p-6">
        <div className="min-w-0">
          <p className="m-0 text-sm font-extrabold uppercase tracking-[0.1em] text-blue-600">Gestión de solicitudes · Formularios</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <h1 className="m-0 text-[clamp(2rem,4vw,2.8rem)] font-black leading-none tracking-[-0.035em] text-[#062e63]">Formularios oficiales</h1>
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700">6 formularios</span>
          </div>
          <p className="mb-0 mt-6 max-w-3xl text-lg leading-7 text-slate-500">Administre el PDF vigente de cada uno de los seis trámites oficiales.</p>
        </div>
        <button className="inline-flex min-h-[52px] cursor-pointer items-center gap-2 rounded-2xl border border-blue-200 bg-white px-6 font-extrabold text-[#0b65b5] shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60" type="button" disabled={loading} onClick={() => void load()}><IconRefresh size={19} aria-hidden="true" /> Actualizar</button>
      </header>
      {success ? (
        <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 px-5 py-4 shadow-[0_12px_30px_rgba(5,150,105,0.12)]" role="status">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-600 shadow-inner" aria-hidden="true"><IconCircleCheckFilled size={27} /></span>
          <div className="min-w-0 flex-1">
            <strong className="block text-base font-extrabold text-emerald-950">Documento actualizado</strong>
            <span className="mt-0.5 block text-sm font-medium text-emerald-800">{success}</span>
          </div>
          <button className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-emerald-700 transition hover:rotate-6 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 motion-reduce:transform-none" type="button" aria-label="Cerrar notificación" onClick={() => setSuccess(null)}><IconX size={19} aria-hidden="true" /></button>
          <span className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 to-cyan-500" aria-hidden="true" />
        </div>
      ) : null}{error ? <p className="m-0 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800" role="alert">{error}</p> : null}
      {loading ? <p className="rounded-2xl bg-white p-8 text-center font-semibold text-[#607a98] shadow-sm" role="status">Cargando formularios oficiales…</p> : items.length === 0 ? <p className="rounded-2xl bg-white p-8 text-center font-semibold text-[#607a98] shadow-sm" role="status">No fue posible obtener el catálogo de formularios oficiales.</p> : (
        <section className="grid grid-cols-2 gap-5 max-[820px]:grid-cols-1" aria-label="Catálogo de formularios oficiales">{items.map((item) => (
          <article className="flex min-w-0 flex-col rounded-[20px] border border-sky-100 bg-white p-6 shadow-[0_10px_28px_rgba(39,112,166,0.1)]" key={item.tipoSolicitudId}><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sky-100 text-[#1476cf]"><IconFileDescription size={27} aria-hidden="true" /></span><div className="min-w-0"><h2 className="m-0 text-xl font-extrabold leading-tight text-[#073b79]">{item.nombre}</h2><span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${item.tienePdf ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{item.tienePdf ? 'PDF cargado' : 'Sin PDF'}</span></div></div><dl className="mt-5 grid gap-3 text-sm"><div><dt className="font-bold text-[#607a98]">Archivo vigente</dt><dd className="m-0 mt-1 break-all font-semibold text-[#173f6e]">{item.nombreArchivo ?? 'No disponible'}</dd></div><div><dt className="font-bold text-[#607a98]">Última actualización</dt><dd className="m-0 mt-1 font-semibold text-[#173f6e]">{item.fechaActualizacion ? formatearFechaHoraAsada(item.fechaActualizacion) : 'Sin cargas registradas'}</dd></div></dl><button className="group mt-6 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl !border-0 bg-gradient-to-r from-[#0872d3] to-[#3298dc] px-5 font-extrabold text-white shadow-md transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[0_14px_26px_rgba(8,114,211,0.3)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-sky-400 motion-reduce:transform-none motion-reduce:transition-none" type="button" onClick={() => { setSuccess(null); setSelected(item) }}><IconUpload className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110 motion-reduce:transform-none" size={19} aria-hidden="true" /> {item.tienePdf ? 'Reemplazar PDF' : 'Subir PDF'}</button></article>
        ))}</section>
      )}
    </div>{selected ? <FormularioOficialUploadDialog formulario={selected} submitting={submitting} onCancel={() => { if (!submitting) setSelected(null) }} onSave={save} /> : null}</main>
  )
}

export default FormulariosOficialesAdminPage
