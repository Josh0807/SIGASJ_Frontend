import { Navigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { IconArrowLeft } from '@tabler/icons-react'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { Alert } from '../../../shared/ui/Alert'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { AdminShell, PageHeader } from '../../../shared/ui'
import AveriaStatusBadge from '../admin/AveriaStatusBadge'
import { useFontaneroAveria } from '../hooks/useFontaneroAveria'
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
  <Button
    to={FONTANERO_AVERIAS_PATH}
    variant="secondary"
    size="sm"
    leftIcon={<IconArrowLeft size={16} aria-hidden="true" />}
  >
    {AVERIAS_FONTANERO_BACK_LABEL}
  </Button>
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
  const [detailIdSource, setDetailIdSource] = useState(id)

  if (id !== detailIdSource) {
    setDetailIdSource(id)
    setResolvedAveria(null)
    setSuccessMessage(null)
    setForceLogin(false)
  }

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
      <main className="admin-content-modern grid w-full min-w-0 gap-4">
        <BackLink />
        <Card padded className="!p-5" role="status" aria-live="polite" aria-busy="true">
          <p className="m-0 font-semibold text-sigasj-muted">
            {AVERIAS_FONTANERO_DETAIL_LOADING_MESSAGE}
          </p>
          <div className="mt-3 grid gap-3" aria-hidden="true">
            <div className="h-12 animate-pulse rounded-xl bg-sigasj-surface-soft motion-reduce:animate-none" />
            <div className="h-24 animate-pulse rounded-xl bg-sigasj-surface-soft motion-reduce:animate-none" />
          </div>
        </Card>
      </main>
    )
  }

  if (forbidden) {
    return (
      <main className="admin-content-modern grid w-full min-w-0 gap-4">
        <Alert tone="danger" role="alert">
          <div className="grid gap-3">
            <h1 className="m-0 text-base font-extrabold">
              {AVERIAS_FONTANERO_DETAIL_FORBIDDEN}
            </h1>
            <BackLink />
          </div>
        </Alert>
      </main>
    )
  }

  if (error) {
    return (
      <main className="admin-content-modern grid w-full min-w-0 gap-4">
        <Alert tone="danger" role="alert">
          <div className="grid gap-3">
            <p className="m-0 font-semibold">{AVERIAS_FONTANERO_DETAIL_ERROR}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={remote.refetch}
              >
                Intentar nuevamente
              </Button>
              <BackLink />
            </div>
          </div>
        </Alert>
      </main>
    )
  }

  if (notFound || averia == null) {
    return (
      <main className="admin-content-modern grid w-full min-w-0 gap-4">
        <Alert tone="info" role="status">
          <div className="grid gap-3">
            <h1 className="m-0 text-base font-extrabold">
              {AVERIAS_FONTANERO_DETAIL_NOT_FOUND}
            </h1>
            <BackLink />
          </div>
        </Alert>
      </main>
    )
  }

  return (
    <AdminShell className="averias-fontanero" aria-labelledby="averia-fontanero-detail-title">
      <PageHeader
        id="averia-fontanero-detail-title"
        title="Avería asignada"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-sigasj-border bg-sigasj-surface-soft px-3 py-1 text-sm font-bold text-sigasj-ink">
              {averia.codigoSeguimiento}
            </span>
            <AveriaStatusBadge estado={averia.estado} />
          </span>
        }
        actions={<BackLink />}
      />

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
    </AdminShell>
  )
}

export default AveriasFontaneroDetailPage
