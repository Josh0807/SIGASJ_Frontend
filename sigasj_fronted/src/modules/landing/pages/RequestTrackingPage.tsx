import { IconArrowRight, IconSearch } from '@tabler/icons-react'
import { type FormEvent, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import PublicFormPage from '../components/PublicFormPage'

const fieldClass =
  'min-h-12 w-full rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-4 font-medium text-sigasj-text outline-none transition focus:border-sigasj-primary focus:ring-3 focus:ring-sigasj-mist aria-invalid:border-rose-300 aria-invalid:ring-rose-100'

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
    <PublicFormPage
      returnTo="/#solicitudes-servicio"
      eyebrow="Consulta pública"
      title="Consultar estado de solicitud"
      description="Ingrese el código de seguimiento y la identificación del solicitante registrados al crear la solicitud."
      ariaLabel="Seguimiento público de solicitudes"
      titleId="tracking-title"
      icon={<IconSearch size={36} aria-hidden="true" />}
      maxWidth="lg"
      card
    >
      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <label
            className="grid gap-2 font-bold text-sigasj-ink"
            htmlFor="tracking-code"
          >
            Código de seguimiento
            <input
              ref={codigoRef}
              className={fieldClass}
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
            className="grid gap-2 font-bold text-sigasj-ink"
            htmlFor="tracking-id"
          >
            Identificación
            <input
              ref={identificacionRef}
              className={fieldClass}
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
          className="group landing-lift-button landing-lift-button--solid flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] border border-sigasj-primary bg-sigasj-primary px-7 text-base font-semibold text-white disabled:cursor-wait disabled:opacity-70"
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
          className="mt-5 rounded-[12px] border border-sigasj-error/30 bg-red-50 p-4 font-semibold text-sigasj-error"
          id="tracking-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-5 mb-0 font-semibold text-sigasj-muted" role="status">
          Consultando…
        </p>
      ) : null}

      {!loading && result ? (
        <SeguimientoPublicoResultado
          resultado={result}
          onNuevaConsulta={nuevaConsulta}
        />
      ) : null}
    </PublicFormPage>
  )
}

export default RequestTrackingPage
