import { Link } from 'react-router-dom'
import './mapa-red.css'
import { MAPA_RED_CENTER, hasGeoInfrastructure } from './mapaRedGeo'
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
            Base OpenStreetMap centrada en San Juan, Santa Cruz
            ({MAPA_RED_CENTER[0].toFixed(4)}, {MAPA_RED_CENTER[1].toFixed(4)}).
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
