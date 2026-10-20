import { IconArrowRight, IconStatusChange } from '@tabler/icons-react'
import { type FormEvent, useLayoutEffect, useState } from 'react'
import { formatearFechaHoraAsada } from '../../../shared/utils/fechaAsada'
import PublicReceiptNavbar from '../../recibos/components/PublicReceiptNavbar'
import { getSolicitudSeguimiento } from '../../solicitudes-publicas/solicitudesPublicasApi'
import { SOLICITUD_ESTADO_LABELS, type SolicitudSeguimiento } from '../../solicitudes-publicas/types'
import Footer from '../components/Footer'

const RequestTrackingPage = () => {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<SolicitudSeguimiento | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = code.trim()
    if (!normalized) {
      setResult(null)
      setError('Ingresa el código de seguimiento recibido al enviar la solicitud.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    try {
      setResult(await getSolicitudSeguimiento(normalized))
    } catch (requestError) {
      const notFound = requestError instanceof Error && requestError.message.includes('HTTP 404')
      setError(notFound ? 'No encontramos una solicitud asociada con ese código.' : 'No fue posible consultar la solicitud. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PublicReceiptNavbar returnTo="/#solicitudes-servicio" />
      <main className="relative isolate min-h-[65vh] overflow-hidden bg-[linear-gradient(135deg,#fbfdff_0%,#edf8ff_55%,#e4f5ff_100%)] px-6 py-14 max-[640px]:px-4 max-[640px]:py-10" aria-label="Seguimiento público de solicitudes" aria-labelledby="tracking-title">
        <div className="pointer-events-none absolute -left-48 top-16 -z-10 h-[430px] w-[390px] rotate-[-18deg] rounded-[45%] bg-sky-200/35" aria-hidden="true" />
        <div className="mx-auto w-full max-w-[900px]">
          <header className="max-w-[760px]">
            <p className="mb-2 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.28em] text-[#1476cf] before:h-0.5 before:w-9 before:bg-[#1476cf]">Consulta pública</p>
            <h1 id="tracking-title" className="m-0 text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-none tracking-[-0.04em] text-[#092e67]">Seguimiento de Solicitudes</h1>
            <p className="mb-0 mt-5 text-base leading-7 text-[#526d8c]">Ingresa el código que recibiste al enviar tu solicitud para consultar su estado actual.</p>
          </header>

          <section className="mt-9 rounded-[24px] border border-white bg-white/90 p-8 shadow-[0_14px_32px_rgba(39,112,166,0.13)] max-[640px]:p-5">
            <form className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 max-[640px]:grid-cols-1" onSubmit={handleSubmit} noValidate>
              <label className="grid gap-2 font-bold text-[#173f6e]" htmlFor="tracking-code">
                Código de seguimiento
                <input className="min-h-12 w-full rounded-xl border border-sky-200 bg-white px-4 font-medium text-slate-800 outline-none transition focus:border-sky-500 focus:ring-3 focus:ring-sky-200" id="tracking-code" name="codigoSeguimiento" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Ej. SOL-2026-ABCD12" autoComplete="off" aria-describedby={error ? 'tracking-error' : undefined} />
              </label>
              <button className="requests-motion-button flex min-h-[54px] min-w-[250px] cursor-pointer items-center justify-center gap-4 rounded-xl border-0 bg-gradient-to-r from-[#0872d3] to-[#3298dc] px-7 text-base font-extrabold text-white shadow-[0_10px_22px_rgba(8,114,211,0.22)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:cursor-wait disabled:opacity-70 max-[640px]:w-full max-[640px]:min-w-0" type="submit" disabled={loading}>
                {loading ? 'Consultando…' : 'Consultar solicitud'} <IconArrowRight className="shrink-0" size={21} stroke={2.5} aria-hidden="true" />
              </button>
            </form>

            {error ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800" id="tracking-error" role="alert">{error}</p> : null}

            {result ? (
              <article className="mt-7 rounded-2xl border border-sky-200 bg-sky-50/70 p-6" aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="m-0 text-xl font-extrabold text-[#073b79]">{result.tipoSolicitud.nombre}</h2>
                  <span className="rounded-full bg-[#1476cf] px-4 py-2 text-sm font-extrabold text-white">{SOLICITUD_ESTADO_LABELS[result.estado] ?? result.estado}</span>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                  <div><dt className="text-sm font-bold text-[#607a98]">Código</dt><dd className="m-0 mt-1 font-extrabold text-[#173f6e]">{result.codigoSeguimiento}</dd></div>
                  <div><dt className="text-sm font-bold text-[#607a98]">Fecha de ingreso</dt><dd className="m-0 mt-1 font-semibold text-[#173f6e]">{formatearFechaHoraAsada(result.fechaIngreso)}</dd></div>
                  <div className="col-span-2 max-[600px]:col-span-1"><dt className="text-sm font-bold text-[#607a98]">Última actualización</dt><dd className="m-0 mt-1 flex items-center gap-2 font-semibold text-[#173f6e]"><IconStatusChange size={20} aria-hidden="true" /> {formatearFechaHoraAsada(result.updatedAt)}</dd></div>
                </dl>
              </article>
            ) : null}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default RequestTrackingPage
