import { useState } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { IconArrowLeft } from '@tabler/icons-react'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import { AdminShell, Alert, Button, EmptyState, PageHeader } from '../../../shared/ui'
import { useAuthUser } from '../../auth/hooks/useAuthUser'
import { useAdminAveria } from '../hooks/useAdminAveria'
import AveriaStatusBadge from './AveriaStatusBadge'
import AveriasAdminDetailView from './AveriasAdminDetailView'
import { canEditAveriaAsignacion } from './canEditAveriaAsignacion'
import { parseAveriaAdminId } from './parseAveriaAdminId'
import { AVERIAS_ADMIN_HISTORIAL_PATH } from './averiasAdminPaths'
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

  if (loading) {
    return (
      <AdminShell className="averias-admin">
        <Alert tone="info">{AVERIAS_ADMIN_DETAIL_LOADING_MESSAGE}</Alert>
      </AdminShell>
    )
  }

  if (error) {
    return (
      <AdminShell className="averias-admin">
        <EmptyState
          title={AVERIAS_ADMIN_DETAIL_ERROR}
          actions={
            <Button to={listPath} variant="secondary">
              {backEmptyLabel}
            </Button>
          }
        />
      </AdminShell>
    )
  }

  if (notFound || averia == null) {
    return (
      <AdminShell className="averias-admin">
        <EmptyState
          title={AVERIAS_ADMIN_DETAIL_NOT_FOUND}
          actions={
            <Button to={listPath} variant="secondary">
              {backEmptyLabel}
            </Button>
          }
        />
      </AdminShell>
    )
  }

  return (
    <AdminShell className="averias-admin min-w-0">
      <PageHeader
        eyebrow="Gestión de averías"
        title="Detalle de avería"
        description={
          <span className="averias-admin__header-meta inline-flex flex-wrap items-center gap-2">
            <span className="averias-admin__codigo font-semibold text-sigasj-ink">
              {averia.codigoSeguimiento}
            </span>
            <AveriaStatusBadge estado={averia.estado} />
          </span>
        }
        actions={
          <Button
            to={listPath}
            variant="secondary"
            leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
          >
            {backLabel || ADMIN_COPY.backToList}
          </Button>
        }
      />
      <AveriasAdminDetailView
        averia={averia}
        canAssignFontanero={canAssignFontanero}
        onAveriaUpdated={setMutatedAveria}
        onUnauthorized={() => setForceLogin(true)}
        onForbidden={() => setForceForbidden(true)}
      />
    </AdminShell>
  )
}

export default AveriasAdminDetailPage
