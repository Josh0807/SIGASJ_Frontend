import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { IconRefresh } from '@tabler/icons-react'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import AdminNavIcon from '../../admin-panel/components/AdminNavIcon'
import IndicatorCard from '../../../shared/components/IndicatorCard'
import QuickAccessCard from '../../../shared/components/QuickAccessCard'
import ActivityFeedback from './ActivityFeedback'
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

  return (
    <main
      className="gallery-admin actividades-resumen-dashboard"
      aria-labelledby="actividades-resumen-title"
    >
      <header className="actividades-fontanero-home__welcome">
        <div className="actividades-fontanero-home__welcome-content">
          <span className="actividades-fontanero-home__eyebrow">{eyebrow}</span>
          <h1 id="actividades-resumen-title">{title}</h1>
          <p className="actividades-fontanero-home__welcome-text">
            {isFontanero
              ? 'Resumen de sus actividades registradas y accesos rápidos al módulo.'
              : 'Resumen general de actividades reportadas y accesos a revisión y reportes.'}
          </p>
        </div>
        <Link
          to={
            isFontanero
              ? ACTIVIDADES_FONTANERO_PATHS.home
              : ACTIVIDADES_ADMIN_PATHS.revision
          }
          className="actividades-fontanero-home__back-link"
        >
          {isFontanero ? 'Volver al inicio del módulo' : 'Ir a revisión'}
        </Link>
      </header>

      <section
        className="actividades-resumen-dashboard__filters"
        aria-label="Filtros del resumen"
      >
        <form className="gallery-admin__filters" onSubmit={handleConsultar}>
          <label className="gallery-admin__field" htmlFor="resumen-fecha-inicio">
            <span>Fecha inicial</span>
            <input
              id="resumen-fecha-inicio"
              type="date"
              value={draft.fechaInicio}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fechaInicio: event.target.value,
                }))
              }
            />
          </label>

          <label className="gallery-admin__field" htmlFor="resumen-fecha-fin">
            <span>Fecha final</span>
            <input
              id="resumen-fecha-fin"
              type="date"
              value={draft.fechaFin}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fechaFin: event.target.value,
                }))
              }
            />
          </label>

          <div className="actividades-admin-reportes__actions">
            <button
              type="submit"
              className="gallery-admin__button gallery-admin__button--primary"
              disabled={loading}
            >
              {loading ? 'Consultando…' : 'Consultar'}
            </button>
            <button
              type="button"
              className="gallery-admin__button gallery-admin__filter-reset"
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
            </button>
            <button
              type="button"
              className="admin-dashboard__refresh-btn"
              onClick={() => refetch()}
              disabled={loading}
              aria-label="Actualizar resumen de actividades"
            >
              <IconRefresh
                className={`admin-dashboard__refresh-icon ${
                  loading ? 'admin-dashboard__refresh-icon--loading' : ''
                }`}
                aria-hidden="true"
                size={18}
                stroke={2}
              />
              Actualizar
            </button>
          </div>
        </form>
      </section>

      {filterError ? (
        <ActivityFeedback
          variant="error"
          message={filterError}
          action={
            <button
              type="button"
              className="activity-feedback__retry"
              onClick={() => {
                setClientError(null)
                refetch()
              }}
            >
              Reintentar
            </button>
          }
        />
      ) : null}

      <section
        className="actividades-resumen-dashboard__indicators"
        aria-label="Indicadores del resumen"
      >
        <div className="admin-dashboard__indicators-grid">
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
          />
        </div>
      </section>

      {!loading && !filterError && Object.keys(resumen.porEstado).length > 0 ? (
        <section
          className="actividades-resumen-dashboard__estados"
          aria-label="Desglose por estado"
        >
          <h2>Desglose por estado</h2>
          <div className="admin-dashboard__indicators-grid">
            {Object.entries(resumen.porEstado)
              .filter(([, cantidad]) => cantidad > 0)
              .map(([estado, cantidad]) => (
                <IndicatorCard
                  key={estado}
                  title={formatActividadEstado(estado)}
                  value={cantidad}
                  badgeText={estado}
                  badgeType="default"
                />
              ))}
          </div>
        </section>
      ) : null}

      <section
        className="actividades-resumen-dashboard__nav"
        aria-label="Accesos rápidos del módulo"
      >
        <h2>Accesos rápidos</h2>
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
      </section>

      {!loading && !filterError && metricas.total === 0 ? (
        <p
          className="actividades-fontanero-home__corrections-status"
          role="status"
          data-testid="resumen-vacio"
        >
          No hay actividades registradas en el periodo consultado.
        </p>
      ) : null}
    </main>
  )
}

export default ActividadesResumenDashboard
