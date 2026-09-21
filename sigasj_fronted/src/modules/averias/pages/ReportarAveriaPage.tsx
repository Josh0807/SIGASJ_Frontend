import { IconArrowLeft, IconDropletExclamation } from '@tabler/icons-react'
import { useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import PublicReceiptNavbar from '../../recibos/components/PublicReceiptNavbar'
import ReportarAveriaForm from '../components/ReportarAveriaForm'

const ReportarAveriaPage = () => {
  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  return (
  <div className="receipt-query-page public-averia-page sigasj-averia-page min-h-screen bg-white" aria-label="Formulario público de reporte de averías">
    <PublicReceiptNavbar returnTo="/#reporte-averias" />

    <main className="receipt-query-page__main sigasj-averia-main bg-white px-5 py-12 max-[640px]:px-4 max-[640px]:py-8">
      <div className="receipt-query-page__container public-averia-page__container sigasj-averia-container mx-auto w-full max-w-[980px]">
        <header className="receipt-query-page__heading sigasj-averia-heading text-center">
          <span className="sigasj-averia-heading-icon mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-sky-100 text-[#0872d3]"><IconDropletExclamation size={36} aria-hidden="true" /></span>
          <p className="public-averia-page__eyebrow">Servicio de agua potable</p>
          <h1>Reportar una avería</h1>
          <p>
            Complete la siguiente información para informar a la ASADA sobre una avería relacionada
            con el servicio de agua potable.
          </p>
        </header>

        <section className="receipt-query-page__search-card public-averia-page__card sigasj-averia-card mt-8 rounded-[24px] border border-sky-100 bg-white p-8 shadow-[0_18px_50px_rgba(39,112,166,0.13)] max-[640px]:p-5">
          <ReportarAveriaForm />
        </section>

        <p className="public-averia-page__back sigasj-averia-back mt-6 text-center">
          <Link className="inline-flex items-center gap-2 font-bold text-[#0872d3] no-underline" to="/#reporte-averias"><IconArrowLeft size={18} aria-hidden="true" /> Volver</Link>
        </p>
      </div>
    </main>
  </div>
  )
}

export default ReportarAveriaPage
