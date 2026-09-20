import { useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicReceiptNavbar from '../../recibos/components/PublicReceiptNavbar'
import { submitPublicQueja } from '../../contacto/services/quejasApi'
import FormSuccessResult from '../../../shared/components/FormSuccessResult'

const TARGET_EMAIL = 'jdasadasanjuan@gmail.com'

const formatDateForDisplay = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

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
  const fechaId = useId()
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
    <div className="complaint-form-page receipt-query-page" aria-label="Formulario público de sugerencias y quejas">
      <PublicReceiptNavbar />

      <main className="receipt-query-page__main">
        <div className="receipt-query-page__container">
          <header className="receipt-query-page__heading">
            <p className="complaint-form-page__eyebrow">Atención al usuario</p>
            <h1>Formulario de Sugerencias y Quejas</h1>
            <p>
              Envíanos la información de tu consulta, sugerencia o queja para brindarle la atención
              correspondiente en la ASADA San Juan.
            </p>
          </header>

          <section className="receipt-query-page__search-card w-full">
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
                      className="receipt-query-page__button receipt-query-page__button--primary"
                      to="/"
                    >
                      Volver al inicio
                    </Link>
                    <button
                      type="button"
                      className="receipt-query-page__button receipt-query-page__button--secondary"
                      onClick={handleReset}
                    >
                      Enviar otra sugerencia
                    </button>
                  </>
                }
              />
            ) : (
              <form className="complaint-form-page__form w-full" noValidate onSubmit={handleFormSubmit}>
                {errorMessage ? (
                  <div className="complaint-form-page__error" role="alert">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="complaint-form-page__field">
                  <label htmlFor={fechaId}>Fecha de la queja (generada automáticamente)</label>
                  <input
                    id={fechaId}
                    type="text"
                    value={dateDisplay}
                    readOnly
                    disabled
                    aria-readonly="true"
                  />
                  <span className="complaint-form-page__help">
                    Fecha registrada automáticamente hoy: <strong>{dateDisplay}</strong>
                  </span>
                </div>

                <div className="complaint-form-page__field">
                  <label htmlFor={nombreId}>
                    Nombre completo <span className="public-averia-form__required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id={nombreId}
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
                    <small id={nombreErrorId} className="complaint-form-page__field-error" role="alert">
                      {nombreError}
                    </small>
                  ) : null}
                </div>

                <div className="complaint-form-page__field">
                  <label htmlFor={descripcionId}>
                    Descripción de la sugerencia o queja{' '}
                    <span className="public-averia-form__required" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id={descripcionId}
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
                    <small id={descripcionErrorId} className="complaint-form-page__field-error" role="alert">
                      {descripcionError}
                    </small>
                  ) : null}
                </div>

                <div className="complaint-form-page__actions">
                  <Link
                    to="/"
                    className="receipt-query-page__button receipt-query-page__button--secondary"
                  >
                    Cancelar y volver
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="receipt-query-page__button receipt-query-page__button--primary"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar sugerencia o queja'}
                  </button>
                </div>

                <p className="complaint-form-page__help">
                  Nota: La información ingresada se enviará directamente a <strong>{TARGET_EMAIL}</strong>.
                </p>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default ComplaintFormPage
