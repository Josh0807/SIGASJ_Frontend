import { useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { IconArrowLeft } from '@tabler/icons-react'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { useAuthUser } from '../../auth/hooks/useAuthUser'
import { useAdminAveria } from '../hooks/useAdminAveria'
import AveriaStatusBadge from './AveriaStatusBadge'
import AveriasAdminDetailView from './AveriasAdminDetailView'
import { canEditAveriaAsignacion } from './canEditAveriaAsignacion'
import { parseAveriaAdminId } from './parseAveriaAdminId'
import { AVERIAS_ADMIN_HISTORIAL_PATH } from './averiasAdminPaths'
import { averiasAdminListPathFromState } from './averiasAdminListSearch'
import { InternalAdminRoleName, normalizeInternalRole } from '../../auth/utils/internalRoles'
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
  const user = useAuthUser()
  const listPath = averiasAdminListPathFromState(location.state)
  const fromHistorial = listPath.startsWith(AVERIAS_ADMIN_HISTORIAL_PATH)
  const backLabel = fromHistorial ? 'Volver al historial' : 'Volver a averías'
  const backEmptyLabel = fromHistorial ? 'Volver al historial' : 'Volver al listado'
  const parsedAveriaId = parseAveriaAdminId(id)
  const [mutatedAveria, setMutatedAveria] = useState<AveriaDetail | null>(null)
  const [forceLogin, setForceLogin] = useState(false)
  const [forceForbidden, setForceForbidden] = useState(false)
  const remoteEnabled =
    averiaProp === undefined &&
    loadingProp === undefined &&
    errorProp === undefined &&
    notFoundProp === undefined
  const remote = useAdminAveria(id, { enabled: remoteEnabled })

  if (remote.unauthorized || forceLogin) {
    return <Navigate to={LOGIN_ROUTE_PATH} replace />
  }

  if (remote.forbidden || forceForbidden) {
    return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  }

  const loading = loadingProp ?? remote.loading
  const error = errorProp === undefined ? remote.error : errorProp
  const notFound = notFoundProp ?? remote.notFound
  const fetchedAveria =
    averiaProp !== undefined ? averiaProp : remote.averia
  const averia =
    mutatedAveria != null &&
    parsedAveriaId != null &&
    mutatedAveria.id === parsedAveriaId
      ? mutatedAveria
      : fetchedAveria
  const canAssignFontanero = user == null || canEditAveriaAsignacion(user)
  const role = normalizeInternalRole(user?.role)
  const canRevisarSolicitudes =
    user == null || role === InternalAdminRoleName.Administradora
  const canRegistrarSalida =
    user == null || role === InternalAdminRoleName.Administradora

  if (loading) {
    return (
      <main className="gallery-admin averias-admin">
        <div className="gallery-admin__shell sigasj-stack">
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
        <div className="gallery-admin__shell sigasj-stack">
          <div className="gallery-admin__empty" role="alert">
            <p>{AVERIAS_ADMIN_DETAIL_ERROR}</p>
            <Link className="gallery-admin__button" to={listPath}>
              {backEmptyLabel}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (notFound || averia == null) {
    return (
      <main className="gallery-admin averias-admin">
        <div className="gallery-admin__shell sigasj-stack">
          <div className="gallery-admin__empty" role="status">
            <h1>{AVERIAS_ADMIN_DETAIL_NOT_FOUND}</h1>
            <Link className="gallery-admin__button" to={listPath}>
              {backEmptyLabel}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="gallery-admin averias-admin w-full min-w-0">
      <div className="gallery-admin__shell sigasj-stack">
        <header className="gallery-admin__header">
          <div>
            <p className="gallery-admin__eyebrow">Gestión de averías</p>
            <h1>Detalle de avería</h1>
            <div className="averias-admin__header-meta">
              <span className="averias-admin__codigo">
                {averia.codigoSeguimiento}
              </span>
              <AveriaStatusBadge estado={averia.estado} />
            </div>
          </div>
          <div className="gallery-admin__header-actions">
            <Link
              className="gallery-admin__button group !inline-flex !min-h-12 !items-center !gap-2.5 !rounded-xl !border !border-blue-200 !bg-gradient-to-br !from-white !to-blue-50 !px-5 !font-extrabold !text-blue-700 !no-underline !shadow-[0_6px_18px_rgba(37,99,235,0.1)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-blue-400 hover:!from-blue-50 hover:!to-sky-100 hover:!shadow-[0_10px_24px_rgba(37,99,235,0.18)] active:!translate-y-0 active:!scale-[0.98]"
              to={listPath}
            >
              <IconArrowLeft className="!transition-transform !duration-300 group-hover:!-translate-x-1" size={19} aria-hidden="true" />
              {backLabel}
            </Link>
          </div>
        </header>
        <AveriasAdminDetailView
          averia={averia}
          canAssignFontanero={canAssignFontanero}
          canRevisarSolicitudes={canRevisarSolicitudes}
          canRegistrarSalida={canRegistrarSalida}
          onAveriaUpdated={setMutatedAveria}
          onUnauthorized={() => setForceLogin(true)}
          onForbidden={() => setForceForbidden(true)}
        />
      </div>
    </main>
  )
}

export default AveriasAdminDetailPage
