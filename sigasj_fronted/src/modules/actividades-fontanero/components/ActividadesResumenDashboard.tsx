import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { IconActivity, IconFilterOff, IconRefresh } from '@tabler/icons-react'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import AdminNavIcon from '../../admin-panel/components/AdminNavIcon'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import IndicatorCard from '../../../shared/components/IndicatorCard'
import QuickAccessCard from '../../../shared/components/QuickAccessCard'
import {
  AdminFilterField,
  AdminFilters,
  AdminShell,
  Alert,
  Button,
  Card,
  PageHeader,
  adminFilterControlClassName,
} from '../../../shared/ui'
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

const MODERN_INDICATOR_CLASS = 'activities-indicator-modern group min-h-[220px]'

const toAppliedFilters = (draft: DateDraft): ResumenActividadesFilters => ({
  fechaInicio: draft.fechaInicio.trim() || undefined,
  fechaFin: draft.fechaFin.trim() || undefined,
})

type ActividadesResumenDashboardProps = {
  scope: ActividadesResumenScope
}

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
      className="actividades-resumen-dashboard gap-5 sm:gap-6"
      aria-labelledby="actividades-resumen-title"
    >
      <PageHeader
        id="actividades-resumen-title"
        eyebrow={eyebrow}
        title={
          <span className="inline-flex items-center gap-2">
            <IconActivity size={22} aria-hidden="true" />
            {title}
          </span>
        }
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
        className="actividades-resumen-dashboard__indicators !m-0 !w-full"
        aria-label="Indicadores del resumen"
      >
        <div className="admin-dashboard__indicators-grid !grid !grid-cols-1 !gap-5 md:!grid-cols-2 xl:!grid-cols-4">
          <IndicatorCard
            title={isFontanero ? 'Actividades registradas' : 'Actividades reportadas'}
            value={loading ? null : metricas.total}
            isLoading={loading}
            description="Total en el periodo consultado"
            badgeText="Total"
            badgeType="info"
            icon={<AdminNavIcon name="actividades" />}
            link={
              isFontanero
                ? ACTIVIDADES_FONTANERO_PATHS.misActividades
                : ACTIVIDADES_ADMIN_PATHS.revision
            }
            className={MODERN_INDICATOR_CLASS}
          />
          <IndicatorCard
            title="Pendientes de revisión"
            value={loading ? null : metricas.pendientesRevision}
            isLoading={loading}
            description="Reportadas o en revisión"
            badgeText="Pendientes"
            badgeType="alert"
            icon={<AdminNavIcon name="solicitudes" />}
            link={
              isFontanero
                ? ACTIVIDADES_FONTANERO_PATHS.misActividades
                : ACTIVIDADES_ADMIN_PATHS.revision
            }
            className={MODERN_INDICATOR_CLASS}
          />
          <IndicatorCard
            title="Revisadas"
            value={loading ? null : metricas.revisadas}
            isLoading={loading}
            description={
              isFontanero
                ? 'Finalizadas o revisadas administrativamente'
                : 'Marcadas como revisadas'
            }
            badgeText="Revisadas"
            badgeType="success"
            icon={<AdminNavIcon name="reportes" />}
            link={
              isFontanero
                ? ACTIVIDADES_FONTANERO_PATHS.historial
                : ACTIVIDADES_ADMIN_PATHS.revision
            }
            className={MODERN_INDICATOR_CLASS}
          />
          <IndicatorCard
            title={
              isFontanero ? 'Corrección solicitada' : 'Corregidas'
            }
            value={
              loading
                ? null
                : isFontanero
                  ? metricas.correccionSolicitada
                  : metricas.corregidas
            }
            isLoading={loading}
            description={
              isFontanero
                ? 'Requieren ajuste y reenvío'
                : 'Reenviadas tras corrección'
            }
            badgeText={isFontanero ? 'Corrección' : 'Corregidas'}
            badgeType="warning"
            icon={<AdminNavIcon name="averias" />}
            link={
              isFontanero
                ? ACTIVIDADES_FONTANERO_PATHS.correcciones
                : ACTIVIDADES_ADMIN_PATHS.revision
            }
            className={MODERN_INDICATOR_CLASS}
          />
        </div>
      </section>

      {!loading && !filterError && estadosConActividad.length > 0 ? (
        <section
          className="actividades-resumen-dashboard__estados"
          aria-label="Desglose por estado"
        >
          <h2>Desglose por estado</h2>
          <div className="admin-dashboard__indicators-grid !grid !grid-cols-1 !gap-5 md:!grid-cols-2 xl:!grid-cols-4">
            {estadosConActividad.map(([estado, cantidad]) => (
                <IndicatorCard
                  key={estado}
                  title={formatActividadEstado(estado)}
                  value={cantidad}
                  badgeText={estado}
                  badgeType="default"
                  className={MODERN_INDICATOR_CLASS}
                />
              ))}
          </div>
        </section>
      ) : null}

      <Card
        as="section"
        padded
        className="actividades-resumen-dashboard__nav"
        aria-label="Accesos rápidos del módulo"
      >
        <h2 className="m-0 mb-4 border-b border-sigasj-border pb-3 text-lg font-extrabold text-sigasj-ink">
          Accesos rápidos
        </h2>
        <div className="actividades-fontanero-home__actions" role="list">
          {isFontanero ? (
            <>
              <div role="listitem">
                <QuickAccessCard
                  title="Registrar actividad"
                  description="Complete un nuevo registro operativo."
                  path={ACTIVIDADES_FONTANERO_PATHS.nueva}
                  icon={<AdminNavIcon name="actividades" />}
                  className="actividades-fontanero-home__card actividades-fontanero-home__card--primary"
                />
              </div>
              <div role="listitem">
                <QuickAccessCard
                  title="Historial"
                  description="Consulte actividades finalizadas."
                  path={ACTIVIDADES_FONTANERO_PATHS.historial}
                  icon={<AdminNavIcon name="reportes" />}
                  className="actividades-fontanero-home__card"
                />
              </div>
              <div role="listitem">
                <QuickAccessCard
                  title="Correcciones pendientes"
                  description="Revise actividades que requieren ajuste."
                  path={ACTIVIDADES_FONTANERO_PATHS.correcciones}
                  icon={<AdminNavIcon name="averias" />}
                  className="actividades-fontanero-home__card"
                />
              </div>
            </>
          ) : (
            <>
              <div role="listitem">
                <QuickAccessCard
                  title="Revisión de actividades"
                  description="Consulte y revise actividades reportadas."
                  path={ACTIVIDADES_ADMIN_PATHS.revision}
                  icon={<AdminNavIcon name="actividades" />}
                  className="actividades-fontanero-home__card actividades-fontanero-home__card--primary"
                />
              </div>
              <div role="listitem">
                <QuickAccessCard
                  title="Reportes"
                  description="Agregados e historial administrativo."
                  path={ACTIVIDADES_ADMIN_PATHS.reportes}
                  icon={<AdminNavIcon name="reportes" />}
                  className="actividades-fontanero-home__card"
                />
              </div>
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
