import { Link } from 'react-router-dom'
import './mapa-red.css'
import { hasGeoInfrastructure } from './mapaRedGeo'
import { MAPA_RED_PATH, MAPA_RED_TITLE } from './mapaRedPaths'

/** Acceso rápido al mapa GIS (sin cifras ni geometrías inventadas). */
export default function MapaRedDashboardWidget() {
  const hasInfra = hasGeoInfrastructure()

  return (
    <section className="mapa-red-widget" aria-labelledby="mapa-red-widget-title">
      <div className="mapa-red-widget__head">
        <div>
          <h2 id="mapa-red-widget-title">{MAPA_RED_TITLE}</h2>
          <p>
            Mapa operativo de San Juan, Santa Cruz: sectores y averías por
            dirección reportada.
          </p>
        </div>
        <Link className="mapa-red-widget__link" to={MAPA_RED_PATH}>
          Abrir mapa
        </Link>
      </div>

      <div className="mapa-red-widget__body mapa-red-widget__body--honest">
        <div className="mapa-red-widget__stat">
          <span>Base cartográfica</span>
          <strong>OpenStreetMap</strong>
        </div>
        <div className="mapa-red-widget__stat">
          <span>Infraestructura GIS</span>
          <strong>
            {hasInfra ? 'Capas cargadas' : 'Pendiente de coordenadas validadas'}
          </strong>
        </div>
        <div className="mapa-red-widget__stat">
          <span>Acceso</span>
          <strong>Solo panel administrativo autorizado</strong>
        </div>
      </div>
    </section>
  )
}
