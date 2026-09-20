import { Link, Navigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LOGIN_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { useFontaneroAveria } from '../hooks/useFontaneroAveria'
import AveriaStatusBadge from '../admin/AveriaStatusBadge'
import AveriasFontaneroDetailView from './AveriasFontaneroDetailView'
import { FONTANERO_AVERIAS_PATH } from './averiasFontaneroPaths'
import {
  AVERIAS_FONTANERO_BACK_LABEL,
  AVERIAS_FONTANERO_DETAIL_ERROR,
  AVERIAS_FONTANERO_DETAIL_FORBIDDEN,
  AVERIAS_FONTANERO_DETAIL_LOADING_MESSAGE,
  AVERIAS_FONTANERO_DETAIL_NOT_FOUND,
  type AveriaFontaneroDetail,
  type AveriaObservacionItem,
} from './types'

export type AveriasFontaneroDetailPageProps = {
  averia?: AveriaFontaneroDetail | null
  loading?: boolean
  error?: string | boolean | null
  notFound?: boolean
  forbidden?: boolean
}

const BackLink = () => (
  <Link className="gallery-admin__button" to={FONTANERO_AVERIAS_PATH}>
    {AVERIAS_FONTANERO_BACK_LABEL}
  </Link>
)

const AveriasFontaneroDetailPage = ({
  averia: averiaProp,
  loading: loadingProp,
  error: errorProp,
  notFound: notFoundProp,
  forbidden: forbiddenProp,
}: AveriasFontaneroDetailPageProps) => {
  const { id } = useParams()
  const remoteEnabled =
    averiaProp === undefined &&
    loadingProp === undefined &&
    errorProp === undefined &&
    notFoundProp === undefined &&
    forbiddenProp === undefined
  const remote = useFontaneroAveria(id, { enabled: remoteEnabled })
  const [resolvedAveria, setResolvedAveria] = useState<AveriaFontaneroDetail | null>(
    null,
  )
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [forceLogin, setForceLogin] = useState(false)

  useEffect(() => {
    setResolvedAveria(null)
    setSuccessMessage(null)
    setForceLogin(false)
  }, [id])

  if (remote.unauthorized || forceLogin) {
    return <Navigate to={LOGIN_ROUTE_PATH} replace />
  }

  const loading = loadingProp ?? remote.loading
  const error = errorProp === undefined ? remote.error : errorProp
  const notFound = notFoundProp ?? remote.notFound
  const forbidden = forbiddenProp ?? remote.forbidden
  const averia =
    resolvedAveria ??
    (averiaProp !== undefined ? averiaProp : remote.averia)

  if (loading) {
    return (
      <main className="gallery-admin averias-admin averias-fontanero">
        <div className="gallery-admin__shell sigasj-stack">
          <div role="status" aria-live="polite" aria-busy="true">
            <p>{AVERIAS_FONTANERO_DETAIL_LOADING_MESSAGE}</p>
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

  if (forbidden) {
    return (
      <main className="gallery-admin averias-admin averias-fontanero">
        <div className="gallery-admin__shell sigasj-stack">
          <div className="gallery-admin__empty" role="alert">
            <h1>{AVERIAS_FONTANERO_DETAIL_FORBIDDEN}</h1>
            <BackLink />
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="gallery-admin averias-admin averias-fontanero">
        <div className="gallery-admin__shell sigasj-stack">
          <div className="gallery-admin__empty" role="alert">
            <p>{AVERIAS_FONTANERO_DETAIL_ERROR}</p>
            <button
              className="gallery-admin__button"
              type="button"
              onClick={remote.refetch}
            >
              Intentar nuevamente
            </button>
            <BackLink />
          </div>
        </div>
      </main>
    )
  }

  if (notFound || averia == null) {
    return (
      <main className="gallery-admin averias-admin averias-fontanero">
        <div className="gallery-admin__shell sigasj-stack">
          <div className="gallery-admin__empty" role="status">
            <h1>{AVERIAS_FONTANERO_DETAIL_NOT_FOUND}</h1>
            <BackLink />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="gallery-admin averias-admin averias-fontanero w-full min-w-0">
      <div className="gallery-admin__shell sigasj-stack">
        <header className="gallery-admin__header">
          <div>
            <p className="gallery-admin__eyebrow">Atención de campo</p>
            <h1>Avería asignada</h1>
            <p className="averias-admin__codigo">{averia.codigoSeguimiento}</p>
            <p className="averias-admin__header-badge">
              <AveriaStatusBadge estado={averia.estado} />
            </p>
          </div>
          <div className="gallery-admin__header-actions">
            <Link className="gallery-admin__link" to={FONTANERO_AVERIAS_PATH}>
              {AVERIAS_FONTANERO_BACK_LABEL}
            </Link>
          </div>
        </header>
        <AveriasFontaneroDetailView
          averia={averia}
          successMessage={successMessage}
          onResolved={(updated, message) => {
            setResolvedAveria(updated)
            setSuccessMessage(message)
          }}
          onAtencionIniciada={(updated, message) => {
            setResolvedAveria(updated)
            setSuccessMessage(message)
          }}
          onClasificada={(updated, message) => {
            setResolvedAveria(updated)
            setSuccessMessage(message)
          }}
          onObservacionCreated={(item: AveriaObservacionItem) => {
            setResolvedAveria((current) => {
              const base = current ?? averia
              const existing = base.observaciones ?? []
              if (existing.some((row) => row.id === item.id)) {
                return base
              }
              return {
                ...base,
                observaciones: [...existing, item],
              }
            })
          }}
          onUnauthorized={() => setForceLogin(true)}
        />
      </div>
    </main>
  )
}

export default AveriasFontaneroDetailPage
