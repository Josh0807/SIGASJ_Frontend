import { useMemo } from 'react'
import { IconArrowLeft, IconDropletDollar } from '@tabler/icons-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PublicFormPage from '../../landing/components/PublicFormPage'
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
      document.getElementById('numeroPajaInput')?.focus()
    }, 100)
  }

  return (
    <PublicFormPage
      returnTo="/#pagos"
      eyebrow="Recibos y pagos"
      title="Consulta de recibo"
      description="Revisa la información de tu recibo de agua ingresando tu número de paja."
      ariaLabel="Consulta pública de recibos"
      icon={<IconDropletDollar size={36} aria-hidden="true" />}
      maxWidth="lg"
    >
      <section className="transparency-motion-card rounded-[16px] border border-sigasj-border bg-sigasj-surface p-7 shadow-[0_4px_14px_rgba(16,43,56,0.05)] max-[640px]:p-5">
        <ReceiptSearchForm
          initialValue={numeroPaja ?? ''}
          onSearch={handleSearch}
          loading={loading}
        />
      </section>

      <section className="mt-6" aria-live="polite">
        {loading ? (
          <div
            className="rounded-[16px] border border-sigasj-border bg-sigasj-surface-soft px-6 py-8 text-center font-semibold text-sigasj-muted"
            role="status"
          >
            Consultando recibo…
          </div>
        ) : null}

        {!loading && error ? (
          <div
            className="rounded-[16px] border border-sigasj-error/30 bg-red-50 px-6 py-5 font-semibold text-sigasj-error"
            role="alert"
          >
            {error}
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
          <div
            className="rounded-[16px] border border-sigasj-error/30 bg-red-50 px-6 py-5 font-semibold text-sigasj-error"
            role="alert"
          >
            El número de paja ingresado no es válido.
          </div>
        ) : null}
      </section>

      <footer className="mt-6 flex justify-center gap-3 max-[560px]:flex-col max-[560px]:items-stretch">
        <button
          type="button"
          className="transparency-motion-button inline-flex min-h-11 items-center justify-center rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-5 text-sm font-semibold text-sigasj-primary-hover"
          onClick={handleConsultAnother}
        >
          Consultar otra paja
        </button>
        <button
          type="button"
          className="landing-lift-button landing-lift-button--solid inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-sigasj-primary bg-sigasj-primary px-5 text-sm font-semibold text-white"
          onClick={() => navigate('/#pagos')}
        >
          <IconArrowLeft size={18} aria-hidden="true" /> Volver
        </button>
      </footer>
    </PublicFormPage>
  )
}

export default ReceiptQueryPage
