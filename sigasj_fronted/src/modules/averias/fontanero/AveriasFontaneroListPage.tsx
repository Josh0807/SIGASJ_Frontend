import { Link, Navigate } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { useFontaneroAverias } from '../hooks/useFontaneroAverias'
import AveriaStatusBadge from '../admin/AveriaStatusBadge'
import { formatAveriaAdminDateTime } from '../admin/formatAveriaAdminDate'
import { esPendienteDeAtencion } from '../utils/averiaPendienteAtencion'
import {
  FONTANERO_AVERIAS_TITLE,
  averiasFontaneroDetailPath,
} from './averiasFontaneroPaths'
import {
  getFontaneroPrioridadLabel,
  getFontaneroTipoLabel,
} from './fontaneroAveriaPresentation'
import {
  AVERIAS_FONTANERO_ATENCION_NO_INICIADA,
  AVERIAS_FONTANERO_DETAIL_FORBIDDEN,
  AVERIAS_FONTANERO_LIST_EMPTY,
  AVERIAS_FONTANERO_LIST_ERROR,
  AVERIAS_FONTANERO_LIST_LOADING,
  type AveriaFontaneroListItem,
} from './types'

export type AveriasFontaneroListPageProps = {
  items?: AveriaFontaneroListItem[]
  loading?: boolean
  error?: string | null
  unauthorized?: boolean
  forbidden?: boolean
}

const AveriasFontaneroListPage = ({
  items: itemsProp,
  loading: loadingProp,
  error: errorProp,
  unauthorized: unauthorizedProp,
  forbidden: forbiddenProp,
}: AveriasFontaneroListPageProps) => {
  const remoteEnabled =
    itemsProp === undefined &&
    loadingProp === undefined &&
    errorProp === undefined &&
    unauthorizedProp === undefined &&
    forbiddenProp === undefined
  const remote = useFontaneroAverias({ enabled: remoteEnabled })

  if (unauthorizedProp ?? remote.unauthorized) {
    return <Navigate to={LOGIN_ROUTE_PATH} replace />
  }

  const items = itemsProp ?? remote.items
  const loading = loadingProp ?? remote.loading
  const error = errorProp === undefined ? remote.error : errorProp
  const forbidden = forbiddenProp ?? remote.forbidden

  return (
    <main className="gallery-admin averias-admin averias-fontanero">
      <div className="gallery-admin__shell">
        <header className="gallery-admin__header">
          <div>
            <p className="gallery-admin__eyebrow">Atención de campo</p>
            <h1>{FONTANERO_AVERIAS_TITLE}</h1>
          </div>
        </header>
        <section
          className="averias-admin__section"
          aria-labelledby="averias-fontanero-list-heading"
        >
          <h2 id="averias-fontanero-list-heading">Averías asignadas</h2>
          {forbidden ? (
            <p className="gallery-admin__empty" role="alert">
              {AVERIAS_FONTANERO_DETAIL_FORBIDDEN}
            </p>
          ) : loading && items.length === 0 ? (
            <p className="gallery-admin__empty" role="status" aria-busy="true">
              {AVERIAS_FONTANERO_LIST_LOADING}
            </p>
          ) : error ? (
            <div className="gallery-admin__empty" role="alert">
              <p>{error || AVERIAS_FONTANERO_LIST_ERROR}</p>
              <button
                className="gallery-admin__button"
                type="button"
                onClick={remote.refetch}
              >
                Intentar nuevamente
              </button>
            </div>
          ) : items.length === 0 ? (
            <p className="gallery-admin__empty" role="status">
              {AVERIAS_FONTANERO_LIST_EMPTY}
            </p>
          ) : (
            <ul className="averias-admin__cards averias-fontanero__list">
              {items.map((item) => (
                <li className="averias-admin__card" key={item.id}>
                  <header className="averias-admin__card-head">
                    <span className="averias-admin__codigo">
                      {item.codigoSeguimiento}
                    </span>
                    <AveriaStatusBadge estado={item.estado} />
                  </header>
                  {esPendienteDeAtencion(String(item.estado)) ? (
                    <p className="averias-admin__estado-note">
                      {AVERIAS_FONTANERO_ATENCION_NO_INICIADA}
                    </p>
                  ) : null}
                  <dl className="averias-admin__card-meta">
                    <div>
                      <dt>Asignación</dt>
                      <dd>{formatAveriaAdminDateTime(item.fechaAsignacion)}</dd>
                    </div>
                    <div>
                      <dt>Sector</dt>
                      <dd>{item.sectorComunidad}</dd>
                    </div>
                    <div>
                      <dt>Ubicación</dt>
                      <dd>{item.ubicacion}</dd>
                    </div>
                    <div>
                      <dt>Prioridad</dt>
                      <dd>{getFontaneroPrioridadLabel(item.prioridad)}</dd>
                    </div>
                    <div>
                      <dt>Tipo</dt>
                      <dd>{getFontaneroTipoLabel(item.tipoAveria)}</dd>
                    </div>
                  </dl>
                  <Link
                    className="gallery-admin__button"
                    to={averiasFontaneroDetailPath(item.id)}
                  >
                    Ver detalle
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default AveriasFontaneroListPage
