import { Link } from 'react-router-dom'
import AdminNavIcon from '../../admin-panel/components/AdminNavIcon'
import QuickAccessCard from '../../../shared/components/QuickAccessCard'
import { ACTIVIDADES_ADMIN_PATHS } from './actividadesAdminPaths'

const ActividadesAdminHomePage = () => (
  <section
    className="actividades-fontanero-home"
    aria-labelledby="actividades-admin-title"
  >
    <header className="actividades-fontanero-home__welcome">
      <div className="actividades-fontanero-home__welcome-content">
        <span className="actividades-fontanero-home__eyebrow">
          Módulo administrativo · Administradora
        </span>
        <h1 id="actividades-admin-title">Actividades del Fontanero</h1>
        <p className="actividades-fontanero-home__welcome-text">
          Revise actividades reportadas, solicite correcciones y consulte
          reportes operativos.
        </p>
      </div>
    </header>

    <div className="actividades-fontanero-home__actions" role="list">
      <div role="listitem">
        <QuickAccessCard
          title="Dashboard operativo"
          description="Resumen de actividades reportadas y pendientes de revisión."
          path={ACTIVIDADES_ADMIN_PATHS.dashboard}
          icon={<AdminNavIcon name="dashboard" />}
          className="actividades-fontanero-home__card actividades-fontanero-home__card--primary"
        />
      </div>

      <div role="listitem">
        <QuickAccessCard
          title="Reportes"
          description="Consulte agregados e historial administrativo del módulo."
          path={ACTIVIDADES_ADMIN_PATHS.reportes}
          icon={<AdminNavIcon name="reportes" />}
          className="actividades-fontanero-home__card"
        />
      </div>
    </div>

    <p>
      <Link to={ACTIVIDADES_ADMIN_PATHS.dashboard}>Ir al dashboard</Link>
    </p>
  </section>
)

export default ActividadesAdminHomePage
