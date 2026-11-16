import { formatearFechaAsada } from '../../../shared/utils/fechaAsada'
import { useId, useRef, useState } from 'react'
import { IconMail, IconMessageCircle } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { submitPublicQueja } from '../../contacto/services/quejasApi'
import FormSuccessResult from '../../../shared/components/FormSuccessResult'
import PublicFormPage from '../components/PublicFormPage'
import {
  FieldCaption,
  ReadonlyDateField,
} from '../../solicitudes-publicas/PublicFormFieldChrome'

const TARGET_EMAIL = 'jdasadasanjuan@gmail.com'

const formatDateForDisplay = (date: Date) => formatearFechaAsada(date)

const fieldClass =
  'mt-2 box-border min-h-12 w-full rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-4 font-medium text-sigasj-text outline-none transition [font-family:var(--font-body)] focus:border-sigasj-primary focus:ring-3 focus:ring-sigasj-mist'

const ComplaintFormPage = () => {
  const currentDate = new Date()
  const dateDisplay = formatDateForDisplay(currentDate)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [nombreError, setNombreError] = useState<string | null>(null)
  const [descripcionError, setDescripcionError] = useState<string | null>(null)
  const submittingRef = useRef(false)

  const nombreId = useId()
  const descripcionId = useId()
  const nombreErrorId = `${nombreId}-error`
  const descripcionErrorId = `${descripcionId}-error`

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submittingRef.current) {
      return
    }

    const nextNombreError = nombre.trim() ? null : 'Ingrese su nombre completo.'
    const nextDescripcionError = descripcion.trim()
      ? null
      : 'Ingrese la descripción de la sugerencia o queja.'
    setNombreError(nextNombreError)
    setDescripcionError(nextDescripcionError)
    if (nextNombreError || nextDescripcionError) {
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await submitPublicQueja({
        fecha: dateDisplay,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        emailDestino: TARGET_EMAIL,
      })
      setSubmitted(true)
    } catch {
      setErrorMessage('No fue posible enviar el formulario. Intente nuevamente.')
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setNombre('')
    setDescripcion('')
    setSubmitted(false)
    setErrorMessage(null)
    setNombreError(null)
    setDescripcionError(null)
  }

  return (
    <PublicFormPage
      returnTo="/#quejas"
      eyebrow="Atención al usuario"
      title="Formulario de Sugerencias y Quejas"
      description="Envíanos la información de tu consulta, sugerencia o queja para brindarle la atención correspondiente en la ASADA San Juan."
      ariaLabel="Formulario público de sugerencias y quejas"
      icon={<IconMessageCircle size={35} aria-hidden="true" />}
      maxWidth="md"
      card
    >
      {submitted ? (
        <FormSuccessResult
          title="Sugerencia o queja enviada exitosamente"
          description={`Muchas gracias, ${nombre}. Tu mensaje registrado con la fecha de hoy (${dateDisplay}) ha sido enviado hacia la ASADA San Juan (${TARGET_EMAIL}).`}
          meta={[
            { label: 'Fecha', value: dateDisplay },
            { label: 'Destino', value: TARGET_EMAIL },
          ]}
          hint="Le daremos el seguimiento correspondiente a tu solicitud."
          actions={
            <>
              <Link
                className="landing-lift-button landing-lift-button--solid inline-flex min-h-11 items-center justify-center rounded-[10px] border border-sigasj-primary bg-sigasj-primary px-5 text-sm font-semibold text-white no-underline"
                to="/#quejas"
              >
                Volver
              </Link>
              <button
                type="button"
                className="transparency-motion-button inline-flex min-h-11 items-center justify-center rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-5 text-sm font-semibold text-sigasj-primary-hover"
                onClick={handleReset}
              >
                Enviar otra sugerencia
              </button>
            </>
          }
        />
      ) : (
        <form className="grid gap-5" noValidate onSubmit={handleFormSubmit}>
          {errorMessage ? (
            <div
              className="rounded-[12px] border border-sigasj-error/30 bg-red-50 px-4 py-3 font-semibold text-sigasj-error"
              role="alert"
            >
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-1.5">
            <ReadonlyDateField label="Fecha de la queja" value={dateDisplay} />
            <span className="text-sm text-sigasj-muted">
              Generada automáticamente (hoy). No se puede editar.
            </span>
          </div>

          <div>
            <label className="inline-flex flex-wrap items-baseline gap-x-1.5 font-bold text-sigasj-ink" htmlFor={nombreId}>
              <FieldCaption label="Nombre completo" required />
            </label>
            <input
              id={nombreId}
              className={fieldClass}
              type="text"
              required
              aria-required="true"
              aria-invalid={Boolean(nombreError)}
              aria-describedby={nombreError ? nombreErrorId : undefined}
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value)
                setNombreError(null)
              }}
              placeholder="Ej. María González Pérez"
            />
            {nombreError ? (
              <small id={nombreErrorId} className="mt-1.5 block text-sm font-semibold text-sigasj-error" role="alert">
                {nombreError}
              </small>
            ) : null}
          </div>

          <div>
            <label className="inline-flex flex-wrap items-baseline gap-x-1.5 font-bold text-sigasj-ink" htmlFor={descripcionId}>
              <FieldCaption label="Descripción de la sugerencia o queja" required />
            </label>
            <textarea
              id={descripcionId}
              className={`${fieldClass} min-h-[140px] resize-y py-3`}
              required
              rows={5}
              aria-required="true"
              aria-invalid={Boolean(descripcionError)}
              aria-describedby={descripcionError ? descripcionErrorId : undefined}
              value={descripcion}
              onChange={(e) => {
                setDescripcion(e.target.value)
                setDescripcionError(null)
              }}
              placeholder="Escribe en detalle tu sugerencia o el motivo de la queja..."
            />
            {descripcionError ? (
              <small id={descripcionErrorId} className="mt-1.5 block text-sm font-semibold text-sigasj-error" role="alert">
                {descripcionError}
              </small>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="landing-lift-button landing-lift-button--solid inline-flex min-h-11 flex-1 items-center justify-center rounded-[10px] border border-sigasj-primary bg-sigasj-primary px-5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar sugerencia o queja'}
            </button>
            <Link
              to="/#quejas"
              className="transparency-motion-button inline-flex min-h-11 items-center justify-center rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-5 text-sm font-semibold text-sigasj-primary-hover no-underline"
            >
              Cancelar y volver
            </Link>
          </div>

          <p className="m-0 flex items-start gap-2 text-sm text-sigasj-muted">
            <IconMail size={18} className="mt-0.5 shrink-0 text-sigasj-primary" aria-hidden="true" />
            <span>
              Nota: La información ingresada se enviará directamente a <strong>{TARGET_EMAIL}</strong>.
            </span>
          </p>
        </form>
      )}
    </PublicFormPage>
  )
}

export default ComplaintFormPage
