import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { IconArrowLeft, IconRefresh } from '@tabler/icons-react'
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

const MODERN_INDICATOR_CLASS =
  'activities-indicator-modern group !min-h-[270px] !overflow-hidden !rounded-[24px] !border !border-blue-100 !bg-linear-to-br !from-white !via-white !to-sky-50/60 !p-6 !shadow-[0_12px_30px_rgba(30,90,156,0.09)] !transition-all !duration-300 hover:!-translate-y-1 hover:!border-blue-200 hover:!shadow-[0_18px_38px_rgba(30,90,156,0.16)]'

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
    <main
      className="gallery-admin actividades-resumen-dashboard !grid !w-full !gap-6"
      aria-labelledby="actividades-resumen-title"
    >
      <header className="actividades-fontanero-home__welcome !m-0 !flex !min-h-[220px] !w-full !items-center !justify-between !gap-8 !overflow-hidden !rounded-[28px] !border !border-blue-100 !bg-linear-to-br !from-white !via-white !to-sky-50/55 !p-8 !shadow-[0_14px_38px_rgba(30,90,156,0.10)] max-[760px]:!min-h-0 max-[760px]:!flex-col max-[760px]:!items-stretch">
        <div className="actividades-fontanero-home__welcome-content !grid !min-w-0 !gap-3">
          <span className="actividades-fontanero-home__eyebrow !m-0 !text-sm !font-extrabold !uppercase !tracking-[0.12em] !text-blue-600">{eyebrow}</span>
          <h1 className="!m-0 !text-[clamp(2.25rem,4vw,3rem)] !font-black !leading-[1.08] !tracking-[-0.035em] !text-[#062e63]" id="actividades-resumen-title">{title}</h1>
          <p className="actividades-fontanero-home__welcome-text !m-0 !max-w-3xl !text-lg !font-normal !leading-8 !text-slate-500">
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
          className="actividades-fontanero-home__back-link group !inline-flex !min-h-12 !items-center !justify-center !gap-2 !rounded-2xl !border !border-blue-200 !bg-white !px-5 !font-extrabold !text-blue-700 !no-underline !shadow-[0_8px_20px_rgba(37,99,235,0.13)] !transition-all !duration-300 hover:!-translate-y-1 hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.22)] active:!translate-y-0 active:!scale-[0.97]"
        >
          <IconArrowLeft className="!transition-transform !duration-300 group-hover:!-translate-x-1" size={18} aria-hidden="true" />
          {isFontanero ? 'Volver al inicio del módulo' : 'Ir a revisión'}
        </Link>
      </header>

      <section
        className="actividades-resumen-dashboard__filters !m-0 !w-full !overflow-hidden !rounded-[28px] !border !border-blue-100 !bg-linear-to-br !from-white !via-white !to-sky-50/55 !p-8 !shadow-[0_14px_38px_rgba(30,90,156,0.10)]"
        aria-label="Filtros del resumen"
      >
        <form className="gallery-admin__filters !m-0 !grid !gap-5 !border-0 !bg-transparent !p-0 !shadow-none lg:!grid-cols-2" onSubmit={handleConsultar}>
          <label className="gallery-admin__field !grid !min-w-0 !gap-2" htmlFor="resumen-fecha-inicio">
            <span>Fecha inicial</span>
            <input
              className="!box-border !min-h-14 !w-full !rounded-2xl !border !border-blue-200 !bg-slate-50/60 !px-4 !text-base !font-semibold !text-[#073b73] !shadow-sm !outline-none !transition-all hover:!border-blue-300 focus:!border-blue-500 focus:!bg-white focus:!ring-4 focus:!ring-blue-100"
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

          <label className="gallery-admin__field !grid !min-w-0 !gap-2" htmlFor="resumen-fecha-fin">
            <span>Fecha final</span>
            <input
              className="!box-border !min-h-14 !w-full !rounded-2xl !border !border-blue-200 !bg-slate-50/60 !px-4 !text-base !font-semibold !text-[#073b73] !shadow-sm !outline-none !transition-all hover:!border-blue-300 focus:!border-blue-500 focus:!bg-white focus:!ring-4 focus:!ring-blue-100"
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

          <div className="actividades-admin-reportes__actions !col-span-full !flex !flex-wrap !gap-3 !border-t !border-blue-100 !pt-5">
            <button
              type="submit"
              className="gallery-admin__button gallery-admin__button--primary !min-h-12 !rounded-2xl !border-0 !bg-linear-to-r !from-blue-600 !to-sky-500 !px-6 !font-extrabold !text-white !shadow-[0_10px_24px_rgba(37,99,235,0.25)] !transition-all !duration-300 hover:!-translate-y-1 hover:!shadow-[0_15px_30px_rgba(37,99,235,0.35)]"
              disabled={loading}
            >
              {loading ? 'Consultando…' : 'Consultar'}
            </button>
            <button
              type="button"
              className="gallery-admin__button gallery-admin__filter-reset !min-h-12 !rounded-2xl !border !border-blue-200 !bg-white !px-6 !font-extrabold !text-blue-700 !shadow-sm !transition-all hover:!-translate-y-1 hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-md"
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
              className="admin-dashboard__refresh-btn !min-h-12 !rounded-2xl !border !border-blue-200 !bg-white !px-6 !font-extrabold !text-blue-700 !shadow-sm !transition-all hover:!-translate-y-1 hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-md"
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

      <section
        className="actividades-resumen-dashboard__nav !m-0 !w-full !overflow-hidden !rounded-[28px] !border !border-blue-100 !bg-linear-to-br !from-white !via-white !to-sky-50/55 !p-8 !shadow-[0_14px_38px_rgba(30,90,156,0.10)]"
        aria-label="Accesos rápidos del módulo"
      >
        <h2 className="!mb-6 !border-b !border-blue-100 !pb-4 !text-2xl !font-black !tracking-[-0.02em] !text-[#062e63]">Accesos rápidos</h2>
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
