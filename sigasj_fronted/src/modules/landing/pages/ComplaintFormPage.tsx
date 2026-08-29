import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicReceiptNavbar from '../../recibos/components/PublicReceiptNavbar'
import { submitPublicQueja } from '../../contacto/services/quejasApi'

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

  const nombreId = useId()
  const fechaId = useId()
  const descripcionId = useId()

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!nombre.trim() || !descripcion.trim()) return

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
      setErrorMessage('Ocurrió un error al enviar el formulario. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setNombre('')
    setDescripcion('')
    setSubmitted(false)
    setErrorMessage(null)
  }

  return (
    <div className="complaint-form-page receipt-query-page" aria-label="Formulario público de sugerencias y quejas">
      <PublicReceiptNavbar />

      <main className="receipt-query-page__main">
        <div className="receipt-query-page__container">
          <header className="receipt-query-page__heading">
            <p
              style={{
                color: '#1e5a9c',
                fontWeight: 700,
                fontSize: '.85rem',
                textTransform: 'uppercase',
                letterSpacing: '.05em',
                margin: '0 0 6px',
              }}
            >
              Atención al usuario
            </p>
            <h1>Formulario de Sugerencias y Quejas</h1>
            <p>
              Envíanos la información de tu consulta, sugerencia o queja para brindarle la atención correspondiente en la ASADA San Juan.
            </p>
          </header>

          <section className="receipt-query-page__search-card" style={{ padding: '32px' }}>
            {submitted ? (
              <div
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 0',
                }}
                role="status"
              >
                <div
                  style={{
                    background: '#eaf7ed',
                    color: '#2e7d32',
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="36"
                    height="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2 style={{ color: '#123f70', margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                  ¡Sugerencia o queja enviada exitosamente!
                </h2>
                <p style={{ color: '#4a6074', margin: 0, lineHeight: 1.6, maxWidth: '520px', fontSize: '1rem' }}>
                  Muchas gracias, <strong>{nombre}</strong>. Tu mensaje registrado con la fecha de hoy (<strong>{dateDisplay}</strong>) ha sido enviado hacia la ASADA San Juan (<strong>{TARGET_EMAIL}</strong>).
                </p>
                <p style={{ color: '#667d92', margin: 0, fontSize: '.9rem' }}>
                  Le daremos el seguimiento correspondiente a tu solicitud.
                </p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
                  <Link
                    className="receipt-query-page__button receipt-query-page__button--primary"
                    to="/"
                    style={{ textDecoration: 'none', textAlign: 'center', minWidth: '160px' }}
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
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {errorMessage ? (
                  <div
                    style={{
                      background: '#ffebee',
                      color: '#c62828',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '.9rem',
                    }}
                    role="alert"
                  >
                    {errorMessage}
                  </div>
                ) : null}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor={fechaId} style={{ fontWeight: 700, color: '#123f70', fontSize: '.9rem' }}>
                    Fecha de la queja (generada automáticamente)
                  </label>
                  <input
                    id={fechaId}
                    type="text"
                    value={dateDisplay}
                    readOnly
                    disabled
                    aria-readonly="true"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #d0e2f0',
                      background: '#f4f8fc',
                      color: '#425a70',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ color: '#5d7386', fontSize: '.8rem' }}>
                    Fecha registrada automáticamente hoy: <strong>{dateDisplay}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor={nombreId} style={{ fontWeight: 700, color: '#123f70', fontSize: '.9rem' }}>
                    Nombre completo <span style={{ color: '#c62828' }}>*</span>
                  </label>
                  <input
                    id={nombreId}
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. María González Pérez"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #c8dceb',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor={descripcionId} style={{ fontWeight: 700, color: '#123f70', fontSize: '.9rem' }}>
                    Descripción de la sugerencia o queja <span style={{ color: '#c62828' }}>*</span>
                  </label>
                  <textarea
                    id={descripcionId}
                    required
                    rows={5}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Escribe en detalle tu sugerencia o el motivo de la queja..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #c8dceb',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '120px',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap',
                    marginTop: '8px',
                  }}
                >
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="receipt-query-page__button receipt-query-page__button--primary"
                    style={{ minHeight: '48px', padding: '12px 28px', fontSize: '1rem' }}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar sugerencia o queja'}
                  </button>
                  <Link
                    to="/"
                    className="receipt-query-page__button receipt-query-page__button--secondary"
                    style={{ textDecoration: 'none', textAlign: 'center' }}
                  >
                    Cancelar y volver
                  </Link>
                </div>

                <p style={{ margin: '8px 0 0', color: '#5d7386', fontSize: '.82rem', lineHeight: 1.5 }}>
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
