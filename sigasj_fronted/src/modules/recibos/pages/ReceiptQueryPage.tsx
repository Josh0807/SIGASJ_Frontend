import { useMemo } from 'react'
import { IconArrowLeft, IconDropletDollar } from '@tabler/icons-react'
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
    navigate('/#pagos')
  }

  return (
    <div className="receipt-query-page sigasj-receipt-query-page min-h-screen bg-white" aria-label="Consulta pública de recibos">
      <PublicReceiptNavbar returnTo="/#pagos" />

      <main className="receipt-query-page__main sigasj-receipt-query-main bg-white px-5 py-12 max-[640px]:px-4 max-[640px]:py-8">
        <div className="receipt-query-page__container sigasj-receipt-query-container mx-auto w-full max-w-[920px]">
          <header className="receipt-query-page__heading sigasj-receipt-query-heading text-center">
            <span className="sigasj-receipt-query-icon mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-sky-100 text-[#0872d3]"><IconDropletDollar size={36} aria-hidden="true" /></span>
            <h1>Consulta de recibo</h1>
            <p>Revisa la información de tu recibo de agua ingresando tu número de paja.</p>
          </header>

          <section className="receipt-query-page__search-card sigasj-receipt-search-card mt-8 rounded-[22px] border border-sky-100 bg-white p-7 shadow-[0_16px_42px_rgba(39,112,166,0.12)]">
            <ReceiptSearchForm
              initialValue={numeroPaja ?? ''}
              onSearch={handleSearch}
              loading={loading}
            />
          </section>

          <section className="receipt-query-page__results sigasj-receipt-results mt-6" aria-live="polite">
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

          <footer className="receipt-query-page__actions sigasj-receipt-query-actions mt-6 flex justify-center gap-3 max-[560px]:flex-col">
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
              <IconArrowLeft size={18} aria-hidden="true" /> Volver
            </button>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default ReceiptQueryPage
