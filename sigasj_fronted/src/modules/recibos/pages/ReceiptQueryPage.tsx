import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PublicReceiptNavbar from '../components/PublicReceiptNavbar'
import ReceiptSearchForm from '../components/ReceiptSearchForm'
import ReceiptDetails from '../components/ReceiptDetails'
import NoPendingReceipts from '../components/NoPendingReceipts'
import { useReceiptQuery } from '../hooks/useReceiptQuery'

export const ReceiptQueryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const pajaParam = searchParams.get('paja')

  const numeroPaja = useMemo(() => {
    if (!pajaParam) return null
    const parsed = Number(pajaParam)
    return isNaN(parsed) || parsed <= 0 ? null : parsed
  }, [pajaParam])

  const { data, loading, error } = useReceiptQuery(numeroPaja)

  const handleSearch = (newPaja: number) => {
    setSearchParams({ paja: String(newPaja) })
  }

  const handleConsultAnother = () => {
    setSearchParams({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      const inputEl = document.getElementById('numeroPajaInput')
      if (inputEl) {
        inputEl.focus()
      }
    }, 100)
  }


  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className="receipt-query-page" aria-label="Consulta pública de recibos">
      <PublicReceiptNavbar />

      <main className="receipt-query-page__main">
        <div className="receipt-query-page__container">
          <header className="receipt-query-page__heading">
            <h1>Consulta de recibo</h1>
            <p>Revisa la información de tu recibo de agua ingresando tu número de paja.</p>
          </header>

          <section className="receipt-query-page__search-card">
            <ReceiptSearchForm
              initialValue={numeroPaja ?? ''}
              onSearch={handleSearch}
              loading={loading}
            />
          </section>

          <section className="receipt-query-page__results" aria-live="polite">
            {loading ? (
              <div className="receipt-query-page__loading" role="status">
                <span className="receipt-query-page__spinner" aria-hidden="true" />
                <p>Consultando recibo...</p>
              </div>
            ) : null}

            {!loading && error ? (
              <div className="receipt-query-page__error-alert" role="alert">
                <span className="receipt-query-page__error-icon" aria-hidden="true">
                  ⚠️
                </span>
                <p>{error}</p>
              </div>
            ) : null}

            {!loading && !error && data ? (
              data.tieneRecibosPendientes && data.recibos && data.recibos.length > 0 ? (
                <ReceiptDetails data={data} />
              ) : (
                <NoPendingReceipts data={data} />
              )
            ) : null}

            {!loading && !error && !data && !numeroPaja && pajaParam ? (
              <div className="receipt-query-page__error-alert" role="alert">
                <p>El número de paja ingresado no es válido.</p>
              </div>
            ) : null}
          </section>

          <footer className="receipt-query-page__actions">
            <button
              type="button"
              className="receipt-query-page__button receipt-query-page__button--secondary"
              onClick={handleConsultAnother}
            >
              Consultar otra paja
            </button>
            <button
              type="button"
              className="receipt-query-page__button receipt-query-page__button--primary"
              onClick={handleGoHome}
            >
              Volver al inicio
            </button>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default ReceiptQueryPage
