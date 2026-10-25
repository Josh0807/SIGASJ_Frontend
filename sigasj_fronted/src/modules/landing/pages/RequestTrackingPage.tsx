import { IconArrowRight } from '@tabler/icons-react'
import { type FormEvent, useLayoutEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PublicReceiptNavbar from '../../recibos/components/PublicReceiptNavbar'
import SeguimientoPublicoResultado from '../../solicitudes-publicas/SeguimientoPublicoResultado'
import { mensajeErrorSeguimientoPublico } from '../../solicitudes-publicas/seguimientoPublicoMessages'
import type { SeguimientoSolicitudPublico } from '../../solicitudes-publicas/seguimientoPublicoTypes'
import {
  CODIGO_SEGUIMIENTO_MAX,
  IDENTIFICACION_SEGUIMIENTO_MAX,
} from '../../solicitudes-publicas/seguimientoPublicoTypes'
import { sanitizarSeguimientoPublico } from '../../solicitudes-publicas/seguimientoPublicoTimelineUtils'
import { validarSeguimientoLocal } from '../../solicitudes-publicas/seguimientoPublicoValidation'
import { consultarSeguimientoPublico } from '../../solicitudes-publicas/solicitudesPublicasApi'
import Footer from '../components/Footer'

const RequestTrackingPage = () => {
  const [searchParams] = useSearchParams()
  const [codigo, setCodigo] = useState(
    () => searchParams.get('codigo')?.trim().toUpperCase() ?? '',
  )
  const [identificacion, setIdentificacion] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    codigo?: string
    identificacion?: string
  }>({})
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SeguimientoSolicitudPublico | null>(null)
  const [loading, setLoading] = useState(false)
  const codigoRef = useRef<HTMLInputElement>(null)
  const identificacionRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current || loading) return

    const { errores, payload } = validarSeguimientoLocal({
      codigo,
      identificacion,
    })

    if (!payload) {
      setFieldErrors(errores)
      setError(null)
      setResult(null)
      if (errores.codigo) {
        codigoRef.current?.focus()
      } else if (errores.identificacion) {
        identificacionRef.current?.focus()
      }
      return
    }

    submittingRef.current = true
    setLoading(true)
    setFieldErrors({})
    setError(null)
    setResult(null)

    try {
      const respuesta = await consultarSeguimientoPublico(payload)
      setResult(sanitizarSeguimientoPublico(respuesta))
    } catch (requestError) {
      setResult(null)
      setError(mensajeErrorSeguimientoPublico(requestError))
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }

  const nuevaConsulta = () => {
    setResult(null)
    setError(null)
    setFieldErrors({})
  }

  return (
    <>
      <PublicReceiptNavbar returnTo="/#solicitudes-servicio" />
      <main
        className="relative isolate min-h-[65vh] overflow-hidden bg-[linear-gradient(135deg,#fbfdff_0%,#edf8ff_55%,#e4f5ff_100%)] px-6 py-14 max-[640px]:px-4 max-[640px]:py-10"
        aria-label="Seguimiento público de solicitudes"
        aria-labelledby="tracking-title"
      >
        <div
          className="pointer-events-none absolute -left-48 top-16 -z-10 h-[430px] w-[390px] rotate-[-18deg] rounded-[45%] bg-sky-200/35"
          aria-hidden="true"
        />
        <div className="mx-auto w-full max-w-[900px]">
          <header className="max-w-[760px]">
            <p className="mb-2 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.28em] text-[#1476cf] before:h-0.5 before:w-9 before:bg-[#1476cf]">
              Consulta pública
            </p>
            <h1
              id="tracking-title"
              className="m-0 text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-none tracking-[-0.04em] text-[#092e67]"
            >
              Consultar estado de solicitud
            </h1>
            <p className="mb-0 mt-5 text-base leading-7 text-[#526d8c]">
              Ingrese el código de seguimiento y la identificación del
              solicitante registrados al crear la solicitud.
            </p>
          </header>

          <section className="mt-9 rounded-[24px] border border-white bg-white/90 p-8 shadow-[0_14px_32px_rgba(39,112,166,0.13)] max-[640px]:p-5">
            <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <label
                  className="grid gap-2 font-bold text-[#173f6e]"
                  htmlFor="tracking-code"
                >
                  Código de seguimiento
                  <input
                    ref={codigoRef}
                    className="min-h-12 w-full rounded-xl border border-sky-200 bg-white px-4 font-medium text-slate-800 outline-none transition focus:border-sky-500 focus:ring-3 focus:ring-sky-200 aria-invalid:border-rose-300 aria-invalid:ring-rose-100"
                    id="tracking-code"
                    name="codigo"
                    type="text"
                    inputMode="text"
                    value={codigo}
                    maxLength={CODIGO_SEGUIMIENTO_MAX}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={loading}
                    aria-invalid={Boolean(fieldErrors.codigo)}
                    aria-describedby={
                      fieldErrors.codigo ? 'tracking-code-error' : undefined
                    }
                    placeholder="Ej. SOL-2026-00001"
                    onChange={(event) => setCodigo(event.target.value)}
                  />
                  {fieldErrors.codigo ? (
                    <span
                      id="tracking-code-error"
                      className="text-sm font-semibold text-rose-700"
                    >
                      {fieldErrors.codigo}
                    </span>
                  ) : null}
                </label>

                <label
                  className="grid gap-2 font-bold text-[#173f6e]"
                  htmlFor="tracking-id"
                >
                  Identificación
                  <input
                    ref={identificacionRef}
                    className="min-h-12 w-full rounded-xl border border-sky-200 bg-white px-4 font-medium text-slate-800 outline-none transition focus:border-sky-500 focus:ring-3 focus:ring-sky-200 aria-invalid:border-rose-300 aria-invalid:ring-rose-100"
                    id="tracking-id"
                    name="identificacion"
                    type="text"
                    inputMode="text"
                    value={identificacion}
                    maxLength={IDENTIFICACION_SEGUIMIENTO_MAX}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={loading}
                    aria-invalid={Boolean(fieldErrors.identificacion)}
                    aria-describedby={
                      fieldErrors.identificacion
                        ? 'tracking-id-error'
                        : undefined
                    }
                    placeholder="Cédula o identificación del solicitante"
                    onChange={(event) => setIdentificacion(event.target.value)}
                  />
                  {fieldErrors.identificacion ? (
                    <span
                      id="tracking-id-error"
                      className="text-sm font-semibold text-rose-700"
                    >
                      {fieldErrors.identificacion}
                    </span>
                  ) : null}
                </label>
              </div>

              <button
                className="group requests-motion-button flex min-h-[58px] w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-0 bg-gradient-to-r from-[#086dcc] via-[#1684d8] to-[#3aa0df] px-7 text-base font-extrabold text-white shadow-[0_12px_26px_rgba(8,114,211,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_17px_34px_rgba(8,114,211,0.34)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-sky-400 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Consultando…' : 'Consultar'}{' '}
                <IconArrowRight
                  className="shrink-0 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
                  size={21}
                  stroke={2.5}
                  aria-hidden="true"
                />
              </button>
            </form>

            {error ? (
              <p
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800"
                id="tracking-error"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            {loading ? (
              <p className="mt-5 mb-0 font-semibold text-slate-600" role="status">
                Consultando…
              </p>
            ) : null}

            {!loading && result ? (
              <SeguimientoPublicoResultado
                resultado={result}
                onNuevaConsulta={nuevaConsulta}
              />
            ) : null}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default RequestTrackingPage
