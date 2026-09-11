import { Link } from 'react-router-dom'
import PublicReceiptNavbar from '../../recibos/components/PublicReceiptNavbar'
import ReportarAveriaForm from '../components/ReportarAveriaForm'

const ReportarAveriaPage = () => (
  <div className="receipt-query-page public-averia-page" aria-label="Formulario público de reporte de averías">
    <PublicReceiptNavbar />

    <main className="receipt-query-page__main">
      <div className="receipt-query-page__container public-averia-page__container">
        <header className="receipt-query-page__heading">
          <p className="public-averia-page__eyebrow">Servicio de agua potable</p>
          <h1>Reportar una avería</h1>
          <p>
            Complete la siguiente información para informar a la ASADA sobre una avería relacionada
            con el servicio de agua potable.
          </p>
        </header>

        <section className="receipt-query-page__search-card public-averia-page__card">
          <ReportarAveriaForm />
        </section>

        <p className="public-averia-page__back">
          <Link to="/">Volver al inicio</Link>
        </p>
      </div>
    </main>
  </div>
)

export default ReportarAveriaPage
