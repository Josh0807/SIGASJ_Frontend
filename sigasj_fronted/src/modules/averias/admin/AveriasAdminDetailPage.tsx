import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { useAdminAveria } from '../hooks/useAdminAveria'
import AveriaStatusBadge from './AveriaStatusBadge'
import AveriasAdminDetailView from './AveriasAdminDetailView'
import { averiasAdminListPathFromState } from './averiasAdminListSearch'
import {
  AVERIAS_ADMIN_DETAIL_ERROR,
  AVERIAS_ADMIN_DETAIL_LOADING_MESSAGE,
  AVERIAS_ADMIN_DETAIL_NOT_FOUND,
  type AveriaDetail,
} from './types'

export type AveriasAdminDetailPageProps = {
  averia?: AveriaDetail | null
  loading?: boolean
  error?: string | boolean | null
  notFound?: boolean
}

const AveriasAdminDetailPage = ({
  averia: averiaProp,
  loading: loadingProp,
  error: errorProp,
  notFound: notFoundProp,
}: AveriasAdminDetailPageProps) => {
  const { id } = useParams()
  const location = useLocation()
  const listPath = averiasAdminListPathFromState(location.state)
  const remoteEnabled =
    averiaProp === undefined &&
    loadingProp === undefined &&
    errorProp === undefined &&
    notFoundProp === undefined
  const remote = useAdminAveria(id, { enabled: remoteEnabled })

  if (remote.unauthorized) {
    return <Navigate to={LOGIN_ROUTE_PATH} replace />
  }

  if (remote.forbidden) {
    return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  }

  const loading = loadingProp ?? remote.loading
  const error = errorProp === undefined ? remote.error : errorProp
  const notFound = notFoundProp ?? remote.notFound
  const averia = averiaProp !== undefined ? averiaProp : remote.averia

  if (loading) {
    return (
      <main className="gallery-admin averias-admin">
        <div className="gallery-admin__shell">
          <div role="status" aria-live="polite" aria-busy="true">
            <p>{AVERIAS_ADMIN_DETAIL_LOADING_MESSAGE}</p>
            <div className="gallery-admin__skeleton" aria-hidden="true">
              <div className="gallery-admin__skeleton-row">
                <span className="indicator-card__skeleton" />
                <span className="indicator-card__skeleton indicator-card__skeleton--badge" />
              </div>
              <div className="gallery-admin__skeleton-row">
                <span className="indicator-card__skeleton" />
                <span className="indicator-card__skeleton" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="gallery-admin averias-admin">
        <div className="gallery-admin__shell">
          <div className="gallery-admin__empty" role="alert">
            <p>{AVERIAS_ADMIN_DETAIL_ERROR}</p>
            <Link className="gallery-admin__button" to={listPath}>
              Volver al listado
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (notFound || averia == null) {
    return (
      <main className="gallery-admin averias-admin">
        <div className="gallery-admin__shell">
          <div className="gallery-admin__empty" role="status">
            <h1>{AVERIAS_ADMIN_DETAIL_NOT_FOUND}</h1>
            <Link className="gallery-admin__button" to={listPath}>
              Volver al listado
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="gallery-admin averias-admin">
      <div className="gallery-admin__shell">
        <header className="gallery-admin__header">
          <div>
            <p className="gallery-admin__eyebrow">Panel administrativo</p>
            <h1>Detalle de avería</h1>
            <p className="averias-admin__codigo">{averia.codigoSeguimiento}</p>
            <p className="averias-admin__header-badge">
              <AveriaStatusBadge estado={averia.estado} />
            </p>
          </div>
          <div className="gallery-admin__header-actions">
            <Link className="gallery-admin__link" to={listPath}>
              Volver a averías
            </Link>
          </div>
        </header>
        <AveriasAdminDetailView averia={averia} />
      </div>
    </main>
  )
}

export default AveriasAdminDetailPage
