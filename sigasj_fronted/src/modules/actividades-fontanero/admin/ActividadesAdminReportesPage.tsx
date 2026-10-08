import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { IconClipboardOff } from '@tabler/icons-react'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import IndicatorCard from '../../../shared/components/IndicatorCard'
import ActivityFeedback from '../components/ActivityFeedback'
import { useAdminActividadesReportes } from '../hooks/useAdminActividadesReportes'
import { useTiposActividadFontanero } from '../hooks/useTiposActividadFontanero'
import { getReportesAdmin } from '../services/actividadesFontaneroApi'
import type { ReporteActividadesFilters } from '../types/actividadReportes'
import { formatActividadFecha } from '../utils/formatActividadFecha'
import { ACTIVIDADES_ADMIN_PATHS } from './actividadesAdminPaths'

const EMPTY = ''

type DraftFilters = {
  fechaInicio: string
  fechaFin: string
  fontaneroId: string
  tipoActividadId: string
}

const EMPTY_DRAFT: DraftFilters = {
  fechaInicio: EMPTY,
  fechaFin: EMPTY,
  fontaneroId: EMPTY,
  tipoActividadId: EMPTY,
}

const toAppliedFilters = (draft: DraftFilters): ReporteActividadesFilters => {
  const tipoRaw = draft.tipoActividadId.trim()
  const tipoActividadId = tipoRaw ? Number(tipoRaw) : undefined
  return {
    fechaInicio: draft.fechaInicio.trim() || undefined,
    fechaFin: draft.fechaFin.trim() || undefined,
    fontaneroId: draft.fontaneroId.trim() || undefined,
    tipoActividadId:
      tipoActividadId !== undefined &&
      Number.isInteger(tipoActividadId) &&
      tipoActividadId > 0
        ? tipoActividadId
        : undefined,
  }
}

const ActividadesAdminReportesPage = () => {
  const [draft, setDraft] = useState<DraftFilters>(EMPTY_DRAFT)
  const [applied, setApplied] = useState<ReporteActividadesFilters>({})
  const [clientError, setClientError] = useState<string | null>(null)
  const [fontaneroOptions, setFontaneroOptions] = useState<string[]>([])

  const {
    tipos,
    isLoading: tiposLoading,
    isUnauthorized: tiposUnauthorized,
    isForbidden: tiposForbidden,
  } = useTiposActividadFontanero()

  const { reporte, loading, error, forbidden, unauthorized, refetch } =
    useAdminActividadesReportes(applied)

  useEffect(() => {
    let cancelled = false

    const loadFontaneros = async () => {
      try {
        const result = await getReportesAdmin({})
        if (cancelled) {
          return
        }
        setFontaneroOptions(
          [
            ...new Set(
              result.porFontanero
                .map((item) => item.fontaneroId?.trim())
                .filter((id): id is string => Boolean(id)),
            ),
          ].sort((a, b) => a.localeCompare(b, 'es')),
        )
      } catch {
        // El hook de reporte muestra errores de la consulta principal.
      }
    }

    void loadFontaneros()

    return () => {
      cancelled = true
    }
  }, [])

  const rangeInvalid =
    Boolean(draft.fechaInicio && draft.fechaFin) &&
    draft.fechaInicio > draft.fechaFin

  const filterError = clientError ?? error

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
      next.fechaFin === applied.fechaFin &&
      next.fontaneroId === applied.fontaneroId &&
      next.tipoActividadId === applied.tipoActividadId

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

  const hasActiveDraft =
    draft.fechaInicio !== EMPTY ||
    draft.fechaFin !== EMPTY ||
    draft.fontaneroId !== EMPTY ||
    draft.tipoActividadId !== EMPTY

  const showEmpty =
    !loading && !filterError && !forbidden && !unauthorized && reporte.total === 0

  const tipoOptions = useMemo(
    () => [...tipos].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es')),
    [tipos],
  )

  if (forbidden || tiposForbidden) {
    return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  }

  if (unauthorized || tiposUnauthorized) {
    return <Navigate to={LOGIN_ROUTE_PATH} replace />
  }

  return (
    <main className="gallery-admin actividades-admin-reportes">
      <div className="gallery-admin__shell sigasj-stack !gap-7">
        <header className="gallery-admin__header !rounded-[28px] !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/70 !px-8 !py-8 !shadow-[0_14px_38px_rgba(30,90,156,0.10)] md:!px-10">
          <div className="min-w-0 space-y-3">
            <span className="gallery-admin__eyebrow">
              Actividades del Fontanero · Administradora
            </span>
            <h1>Reporte de actividades del Fontanero</h1>
            <p>
              Consulte totales, cantidades por tipo y el detalle de actividades
              registradas. Los cálculos provienen del servidor.
            </p>
          </div>
          <div className="gallery-admin__header-actions">
            <Link
              to={ACTIVIDADES_ADMIN_PATHS.home}
              className="gallery-admin__link !inline-flex !items-center !justify-center !rounded-2xl !border !border-blue-200 !bg-white !px-6 !py-3.5 !font-bold !text-blue-700 !no-underline !shadow-md transition hover:-translate-y-0.5 hover:!bg-blue-50"
            >
              Volver al módulo
            </Link>
          </div>
        </header>

        <form
          className="gallery-admin__filters !rounded-[28px] !border-blue-100 !bg-white/90 !p-7 !shadow-[0_14px_38px_rgba(30,90,156,0.08)]"
          aria-label="Filtros del reporte"
          onSubmit={handleConsultar}
          noValidate
        >
          <div className="col-span-full border-b border-blue-100 pb-5"><p className="mb-1 text-sm font-black uppercase tracking-[0.12em] text-blue-600">Consulta del reporte</p><h2 className="m-0 text-2xl font-black tracking-tight text-[#07376f]">Filtrar actividades</h2><p className="mt-2 text-base text-slate-500">Defina los criterios para generar el resumen de actividades.</p></div>
          <label className="gallery-admin__field" htmlFor="reportes-fecha-inicio">
            <span>Fecha inicial</span>
            <input
              id="reportes-fecha-inicio"
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

          <label className="gallery-admin__field" htmlFor="reportes-fecha-fin">
            <span>Fecha final</span>
            <input
              id="reportes-fecha-fin"
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

          <label className="gallery-admin__field" htmlFor="reportes-fontanero">
            <span>Fontanero</span>
            <select
              id="reportes-fontanero"
              value={draft.fontaneroId}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fontaneroId: event.target.value,
                }))
              }
            >
              <option value="">Todos</option>
              {fontaneroOptions.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>

          <label className="gallery-admin__field" htmlFor="reportes-tipo">
            <span>Tipo de actividad</span>
            <select
              id="reportes-tipo"
              value={draft.tipoActividadId}
              disabled={tiposLoading}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  tipoActividadId: event.target.value,
                }))
              }
            >
              <option value="">Todos</option>
              {tipoOptions.map((tipo) => (
                <option key={tipo.id} value={String(tipo.id)}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="actividades-admin-reportes__actions">
            <button
              type="submit"
              className="gallery-admin__button gallery-admin__button--primary !rounded-2xl !border-0 !bg-gradient-to-r !from-blue-600 !to-sky-500 !px-7 !py-3.5 !font-bold !text-white !shadow-lg !shadow-blue-200"
              disabled={loading}
            >
              {loading ? 'Consultando…' : 'Consultar'}
            </button>
            <button
              type="button"
              className="gallery-admin__button gallery-admin__filter-reset !rounded-2xl !border-blue-200 !bg-white !px-6 !py-3.5 !font-bold !text-blue-700 !shadow-md"
              onClick={handleLimpiar}
              disabled={loading || (!hasActiveDraft && Object.keys(applied).length === 0)}
            >
              Limpiar filtros
            </button>
          </div>
        </form>

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
          className="actividades-admin-reportes__indicators rounded-[28px] border border-blue-100 bg-white/90 p-7 shadow-[0_14px_38px_rgba(30,90,156,0.08)]"
          aria-label="Indicadores del reporte"
        >
          <div className="mb-6 border-b border-blue-100 pb-5"><p className="mb-1 text-sm font-black uppercase tracking-[0.12em] text-blue-600">Resultados del reporte</p><h2 className="m-0 text-2xl font-black tracking-tight text-[#07376f]">Indicadores de actividades</h2><p className="mt-2 text-base text-slate-500">Totales calculados según los filtros aplicados.</p></div>
          <div className="admin-dashboard__indicators-grid">
            <IndicatorCard
              title="Total de actividades"
              value={loading ? null : reporte.total}
              isLoading={loading}
              description="Según los filtros aplicados"
              badgeText="Total"
              badgeType="info"
              className="activities-indicator-modern"
            />
            {(loading ? [] : reporte.porTipo).map((item) => (
              <IndicatorCard
                key={`${item.tipoActividadId ?? 'sin-tipo'}-${item.tipoActividadNombre}`}
                title={item.tipoActividadNombre || 'Sin tipo'}
                value={item.cantidad}
                description="Actividades por tipo"
                badgeText="Tipo"
                badgeType="default"
                className="activities-indicator-modern"
              />
            ))}
          </div>
        </section>

        <section
          className="actividades-admin-reportes__listado rounded-[28px] border border-blue-100 bg-white/90 p-7 shadow-[0_14px_38px_rgba(30,90,156,0.08)]"
          aria-labelledby="reportes-listado-title"
        >
          <div className="mb-6 border-b border-blue-100 pb-5">
            <p className="mb-1 text-sm font-black uppercase tracking-[0.12em] text-blue-600">Detalle del reporte</p>
            <h2 className="m-0 text-2xl font-black tracking-tight text-[#07376f]" id="reportes-listado-title">Listado de actividades</h2>
            <p className="mt-2 text-base text-slate-500">Fecha, fontanero responsable y tipo de actividad.</p>
          </div>

          {loading ? (
            <div
              className="gallery-admin__skeleton"
              aria-busy="true"
              aria-label="Cargando reporte de actividades"
            >
              <div className="gallery-admin__skeleton-row" />
              <div className="gallery-admin__skeleton-row" />
              <div className="gallery-admin__skeleton-row" />
            </div>
          ) : null}

          {showEmpty ? (
            <div className="gallery-admin__empty !flex !min-h-[180px] !flex-col !items-center !justify-center !rounded-3xl !border !border-dashed !border-blue-200 !bg-gradient-to-br !from-white !to-sky-50/70 !px-6 !py-10 !text-center !shadow-inner" role="status">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><IconClipboardOff size={28} aria-hidden="true" /></span>
              <h3 className="m-0 text-lg font-black text-[#07376f]">Sin actividades encontradas</h3>
              <p className="mb-0 mt-2 text-base text-slate-500">No se encontraron actividades con los filtros seleccionados.</p>
            </div>
          ) : null}

          {!loading && !showEmpty && !filterError ? (
            <div className="table-responsive">
              <table className="actividades-admin-reportes__table">
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Fontanero</th>
                    <th scope="col">Tipo de actividad</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.actividades.map((actividad) => (
                    <tr key={actividad.id}>
                      <td>{formatActividadFecha(actividad.fechaActividad)}</td>
                      <td>{actividad.fontaneroId}</td>
                      <td>{actividad.tipoActividadNombre || 'Sin tipo'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default ActividadesAdminReportesPage
