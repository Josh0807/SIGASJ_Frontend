import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  IconArrowRight,
  IconChartBar,
  IconClipboardList,
  IconFileDescription,
  IconFilterOff,
  IconHistory,
  IconPlus,
  IconRefresh,
  IconTool,
} from '@tabler/icons-react'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import {
  AdminFilterField,
  AdminFilters,
  AdminShell,
  Alert,
  Badge,
  Button,
  Card,
  PageHeader,
  adminFilterControlClassName,
} from '../../../shared/ui'
import type { BadgeProps } from '../../../shared/ui'
import {
  useActividadesResumen,
  type ActividadesResumenScope,
} from '../hooks/useActividadesResumen'
import type { ResumenActividadesFilters } from '../types/actividadResumen'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { ACTIVIDADES_ADMIN_PATHS } from '../admin/actividadesAdminPaths'
import {
  buildAdminResumenMetricas,
  buildFontaneroResumenMetricas,
} from '../utils/actividadResumenMetrics'
import { formatActividadEstado } from '../utils/formatActividadEstado'

type DateDraft = {
  fechaInicio: string
  fechaFin: string
}

const EMPTY_DRAFT: DateDraft = { fechaInicio: '', fechaFin: '' }

const toAppliedFilters = (draft: DateDraft): ResumenActividadesFilters => ({
  fechaInicio: draft.fechaInicio.trim() || undefined,
  fechaFin: draft.fechaFin.trim() || undefined,
})

type ActividadesResumenDashboardProps = {
  scope: ActividadesResumenScope
}

type ResumenMetricTileProps = {
  title: string
  description: string
  badgeLabel: string
  badgeTone: NonNullable<BadgeProps['tone']>
  value: number | null
  loading: boolean
  to: string
  buttonVariant: 'primary' | 'secondary'
  icon: ReactNode
}

const ResumenMetricTile = ({
  title,
  description,
  badgeLabel,
  badgeTone,
  value,
  loading,
  to,
  buttonVariant,
  icon,
}: ResumenMetricTileProps) => {
  const displayValue = loading ? '—' : (value ?? 0)

  return (
    <Card padded className="flex min-h-[200px] flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eaf6ff] text-[#1e5a9c]">
          {icon}
        </span>
        <Badge tone={badgeTone}>{badgeLabel}</Badge>
      </div>
      <div className="grid gap-1">
        <p
          className="m-0 text-3xl font-extrabold tabular-nums text-[#073b73]"
          aria-live="polite"
        >
          {displayValue}
        </p>
        <h3 className="m-0 text-base font-extrabold text-sigasj-ink">{title}</h3>
        <p className="m-0 text-sm leading-relaxed text-sigasj-muted">
          {description}
        </p>
      </div>
      <Button
        to={to}
        variant={buttonVariant}
        size="sm"
        className="mt-auto w-fit"
      >
        Ver detalles
      </Button>
    </Card>
  )
}

type QuickAccessLinkProps = {
  to: string
  title: string
  description: string
  icon: ReactNode
}

const QuickAccessLink = ({
  to,
  title,
  description,
  icon,
}: QuickAccessLinkProps) => (
  <Link
    to={to}
    className="group relative flex gap-4 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-[#f5faff] p-4 no-underline shadow-[0_2px_8px_rgba(30,90,156,0.04)] transition hover:border-[rgba(90,174,230,0.55)] hover:shadow-[0_8px_20px_rgba(30,90,156,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sigasj-primary/40 sm:p-5"
    aria-label={`Acceso rápido a ${title}`}
  >
    <span
      className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-sigasj-primary"
      aria-hidden="true"
    />
    <span className="ml-2 grid size-11 shrink-0 place-items-center rounded-xl border border-[#cfe4f7] bg-[#eaf6ff] text-[#1e5a9c]">
      {icon}
    </span>
    <div className="min-w-0 flex-1 grid gap-1">
      <h3 className="m-0 text-base font-extrabold text-[#073b73]">{title}</h3>
      <p className="m-0 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
    <span
      className="grid size-9 shrink-0 place-items-center self-center rounded-full border border-slate-200 bg-white text-sigasj-primary transition group-hover:border-sigasj-primary group-hover:bg-sigasj-primary group-hover:text-white"
      aria-hidden="true"
    >
      <IconArrowRight size={18} stroke={2} />
    </span>
  </Link>
)

const ActividadesResumenDashboard = ({
  scope,
}: ActividadesResumenDashboardProps) => {
  const [draft, setDraft] = useState<DateDraft>(EMPTY_DRAFT)
  const [applied, setApplied] = useState<ResumenActividadesFilters>({})
  const [clientError, setClientError] = useState<string | null>(null)

  const { resumen, loading, error, forbidden, unauthorized, refetch } =
    useActividadesResumen(scope, applied)

  const metricas = useMemo(
    () =>
      scope === 'admin'
        ? buildAdminResumenMetricas(resumen)
        : buildFontaneroResumenMetricas(resumen),
    [resumen, scope],
  )

  const rangeInvalid =
    Boolean(draft.fechaInicio && draft.fechaFin) &&
    draft.fechaInicio > draft.fechaFin

  const filterError = clientError ?? error
  const isFontanero = scope === 'fontanero'

  const handleConsultar = (event: FormEvent) => {
    event.preventDefault()
    setClientError(null)

    if (rangeInvalid) {
      setClientError('La fecha inicial no puede ser posterior a la fecha final.')
      return
    }

    const next = toAppliedFilters(draft)
    const unchanged =
      next.fechaInicio === applied.fechaInicio &&
      next.fechaFin === applied.fechaFin

    if (unchanged) {
      refetch()
      return
    }

    setApplied(next)
  }

  const handleLimpiar = () => {
    setDraft(EMPTY_DRAFT)
    setClientError(null)
    setApplied({})
  }

  if (unauthorized) {
    return <Navigate to={LOGIN_ROUTE_PATH} replace />
  }

  if (forbidden) {
    return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  }

  const title = isFontanero
    ? 'Dashboard de actividades'
    : 'Dashboard operativo'
  const eyebrow = isFontanero
    ? 'Módulo operativo · Fontanero'
    : 'Módulo administrativo · Administradora'
  const estadosConActividad = Object.entries(resumen.porEstado).filter(
    ([, cantidad]) => cantidad > 0,
  )

  return (
    <AdminShell
      className="gap-5 sm:gap-6"
      aria-labelledby="actividades-resumen-title"
    >
      <PageHeader
        id="actividades-resumen-title"
        eyebrow={eyebrow}
        title={title}
        description={
          isFontanero
            ? 'Resumen de sus actividades registradas y accesos rápidos al módulo.'
            : 'Resumen general de actividades reportadas y accesos a revisión y reportes.'
        }
        actions={
          <Button
            to={
              isFontanero
                ? ACTIVIDADES_FONTANERO_PATHS.home
                : ACTIVIDADES_ADMIN_PATHS.revision
            }
            variant="secondary"
          >
            {isFontanero ? 'Volver al inicio del módulo' : 'Ir a revisión'}
          </Button>
        }
      />

      <form onSubmit={handleConsultar}>
        <AdminFilters aria-label="Filtros del resumen">
          <AdminFilterField label="Fecha inicial">
            <input
              id="resumen-fecha-inicio"
              type="date"
              className={adminFilterControlClassName}
              value={draft.fechaInicio}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fechaInicio: event.target.value,
                }))
              }
            />
          </AdminFilterField>

          <AdminFilterField label="Fecha final">
            <input
              id="resumen-fecha-fin"
              type="date"
              className={adminFilterControlClassName}
              value={draft.fechaFin}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fechaFin: event.target.value,
                }))
              }
            />
          </AdminFilterField>

          <div className="col-span-full flex flex-wrap gap-2">
            <Button type="submit" variant="primary" loading={loading}>
              {loading ? 'Consultando…' : 'Consultar'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              leftIcon={<IconFilterOff size={16} aria-hidden="true" />}
              onClick={handleLimpiar}
              disabled={
                loading ||
                (!draft.fechaInicio &&
                  !draft.fechaFin &&
                  !applied.fechaInicio &&
                  !applied.fechaFin)
              }
            >
              Limpiar filtros
            </Button>
            <Button
              type="button"
              variant="secondary"
              leftIcon={<IconRefresh size={16} aria-hidden="true" />}
              onClick={() => refetch()}
              disabled={loading}
              aria-label="Actualizar resumen de actividades"
            >
              Actualizar
            </Button>
          </div>
        </AdminFilters>
      </form>

      {filterError ? (
        <Alert tone="danger">
          <div className="grid gap-3">
            <p className="m-0 font-semibold">{filterError}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="justify-self-start"
              onClick={() => {
                setClientError(null)
                refetch()
              }}
            >
              {ADMIN_COPY.retry}
            </Button>
          </div>
        </Alert>
      ) : null}

      <section
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        aria-label="Indicadores del resumen"
        aria-busy={loading}
      >
        <ResumenMetricTile
          title={
            isFontanero ? 'Actividades registradas' : 'Actividades reportadas'
          }
          description="Total en el periodo consultado"
          badgeLabel="Total"
          badgeTone="info"
          value={loading ? null : metricas.total}
          loading={loading}
          to={
            isFontanero
              ? ACTIVIDADES_FONTANERO_PATHS.misActividades
              : ACTIVIDADES_ADMIN_PATHS.revision
          }
          buttonVariant="secondary"
          icon={<IconClipboardList size={22} stroke={2} aria-hidden="true" />}
        />
        <ResumenMetricTile
          title="Pendientes de revisión"
          description="Reportadas o en revisión"
          badgeLabel="Pendientes"
          badgeTone="danger"
          value={loading ? null : metricas.pendientesRevision}
          loading={loading}
          to={
            isFontanero
              ? ACTIVIDADES_FONTANERO_PATHS.misActividades
              : ACTIVIDADES_ADMIN_PATHS.revision
          }
          buttonVariant="primary"
          icon={<IconFileDescription size={22} stroke={2} aria-hidden="true" />}
        />
        <ResumenMetricTile
          title="Revisadas"
          description={
            isFontanero
              ? 'Finalizadas o revisadas administrativamente'
              : 'Marcadas como revisadas'
          }
          badgeLabel="Revisadas"
          badgeTone="success"
          value={loading ? null : metricas.revisadas}
          loading={loading}
          to={
            isFontanero
              ? ACTIVIDADES_FONTANERO_PATHS.historial
              : ACTIVIDADES_ADMIN_PATHS.revision
          }
          buttonVariant="secondary"
          icon={<IconChartBar size={22} stroke={2} aria-hidden="true" />}
        />
        <ResumenMetricTile
          title={isFontanero ? 'Corrección solicitada' : 'Corregidas'}
          description={
            isFontanero
              ? 'Requieren ajuste y reenvío'
              : 'Reenviadas tras corrección'
          }
          badgeLabel={isFontanero ? 'Corrección' : 'Corregidas'}
          badgeTone="warning"
          value={
            loading
              ? null
              : isFontanero
                ? metricas.correccionSolicitada
                : metricas.corregidas
          }
          loading={loading}
          to={
            isFontanero
              ? ACTIVIDADES_FONTANERO_PATHS.correcciones
              : ACTIVIDADES_ADMIN_PATHS.revision
          }
          buttonVariant="secondary"
          icon={<IconTool size={22} stroke={2} aria-hidden="true" />}
        />
      </section>

      {!loading && !filterError && estadosConActividad.length > 0 ? (
        <section aria-label="Desglose por estado" className="grid gap-4">
          <h2 className="m-0 text-lg font-extrabold text-sigasj-ink">
            Desglose por estado
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {estadosConActividad.map(([estado, cantidad]) => (
              <Card key={estado} padded className="grid gap-2">
                <Badge tone="neutral" className="w-fit uppercase tracking-wide">
                  {estado}
                </Badge>
                <p className="m-0 text-3xl font-extrabold tabular-nums text-[#073b73]">
                  {cantidad}
                </p>
                <p className="m-0 text-sm font-semibold text-sigasj-ink">
                  {formatActividadEstado(estado)}
                </p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <Card as="section" padded aria-label="Accesos rápidos del módulo">
        <h2 className="m-0 mb-4 border-b border-sigasj-border pb-3 text-lg font-extrabold text-sigasj-ink">
          Accesos rápidos
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {isFontanero ? (
            <>
              <QuickAccessLink
                to={ACTIVIDADES_FONTANERO_PATHS.nueva}
                title="Registrar actividad"
                description="Complete un nuevo registro operativo."
                icon={<IconPlus size={22} stroke={2} aria-hidden="true" />}
              />
              <QuickAccessLink
                to={ACTIVIDADES_FONTANERO_PATHS.historial}
                title="Historial"
                description="Consulte actividades finalizadas."
                icon={<IconHistory size={22} stroke={2} aria-hidden="true" />}
              />
              <QuickAccessLink
                to={ACTIVIDADES_FONTANERO_PATHS.correcciones}
                title="Correcciones pendientes"
                description="Revise actividades que requieren ajuste."
                icon={<IconTool size={22} stroke={2} aria-hidden="true" />}
              />
            </>
          ) : (
            <>
              <QuickAccessLink
                to={ACTIVIDADES_ADMIN_PATHS.revision}
                title="Revisión de actividades"
                description="Consulte y revise actividades reportadas."
                icon={<IconClipboardList size={22} stroke={2} aria-hidden="true" />}
              />
              <QuickAccessLink
                to={ACTIVIDADES_ADMIN_PATHS.reportes}
                title="Reportes"
                description="Agregados e historial administrativo."
                icon={<IconChartBar size={22} stroke={2} aria-hidden="true" />}
              />
            </>
          )}
        </div>
      </Card>

      {!loading && !filterError && metricas.total === 0 ? (
        <Alert tone="info" role="status" data-testid="resumen-vacio">
          No hay actividades registradas en el periodo consultado.
        </Alert>
      ) : null}
    </AdminShell>
  )
}

export default ActividadesResumenDashboard