import { Link } from 'react-router-dom'

const AbonadosAdminPage = () => (
  <main className="gallery-admin" aria-labelledby="abonados-admin-title">
    <header className="gallery-admin__header">
      <div>
        <h1 id="abonados-admin-title">Gestión de abonados</h1>
        <p>Registre nuevos abonados y consulte el padrón del sistema.</p>
      </div>
      <Link className="gallery-admin__primary-action" to="/admin/abonados/nuevo">
        Registrar abonado
      </Link>
    </header>

    <section className="gallery-admin__panel">
      <p>El listado de abonados estará disponible próximamente.</p>
    </section>
  </main>
)

export default AbonadosAdminPage
