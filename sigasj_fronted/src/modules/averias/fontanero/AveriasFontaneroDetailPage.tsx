import { Navigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { IconArrowLeft, IconTool } from '@tabler/icons-react'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { Alert } from '../../../shared/ui/Alert'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import AveriaStatusBadge from '../admin/AveriaStatusBadge'
import { useFontaneroAveria } from '../hooks/useFontaneroAveria'
import AveriaFaucetIllustration from './AveriaFaucetIllustration'
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
    <main className="averias-fontanero admin-content-modern grid w-full min-w-0 gap-4">
      <div className="justify-self-start">
        <BackLink />
      </div>

      <header className="gallery-admin__header relative overflow-hidden rounded-[1.5rem] border border-[#d7e8f7] bg-gradient-to-br from-white via-[#f7fbff] to-[#eaf4ff] px-5 py-5 shadow-[0_14px_32px_rgba(30,90,156,0.1)] sm:min-h-[8.5rem] sm:px-7 sm:py-6">
        <div
          className="pointer-events-none absolute -right-2 -bottom-6 hidden size-52 rounded-full bg-[radial-gradient(circle,rgba(186,230,253,0.55)_0%,rgba(224,242,254,0.2)_48%,transparent_72%)] sm:block"
          aria-hidden="true"
        />

        {/* Tubo + llave bajados: manija visible, codo recortado abajo */}
        <AveriaFaucetIllustration className="pointer-events-none absolute -bottom-3 -right-1 z-[1] hidden h-[11.5rem] w-[15rem] sm:block lg:-bottom-4 lg:right-0 lg:h-[12.5rem] lg:w-[16.5rem]" />

        <div className="relative z-[2] grid max-w-[34rem] items-center gap-4 pr-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-5 sm:pr-40">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#1e5a9c] to-[#38bdf8] text-white shadow-[0_10px_22px_rgba(30,90,156,0.28)] sm:size-[4.25rem]">
            <IconTool size={30} stroke={2.2} aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <p className="gallery-admin__eyebrow m-0 mb-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-sigasj-primary">
              Atención de campo
            </p>
            <h1 className="m-0 text-[clamp(1.45rem,2.6vw,1.85rem)] font-black tracking-[-0.03em] text-sigasj-ink">
              Avería asignada
            </h1>
            <div className="averias-fontanero__header-meta mt-3 flex flex-wrap items-center gap-2">
              <p className="averias-admin__codigo m-0 inline-flex rounded-full border border-[#cfe4f7] bg-[#f3f9ff] px-3.5 py-1.5 text-sm font-extrabold text-sigasj-ink shadow-sm">
                {averia.codigoSeguimiento}
              </p>
              <p className="averias-admin__header-badge m-0">
                <AveriaStatusBadge estado={averia.estado} />
              </p>
            </div>
          </div>
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
    </main>
  )
}

export default AveriasFontaneroDetailPage
