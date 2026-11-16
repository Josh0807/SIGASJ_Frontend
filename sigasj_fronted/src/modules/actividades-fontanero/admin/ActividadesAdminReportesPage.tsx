import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { IconClipboardOff, IconSearch } from '@tabler/icons-react'
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
import { formatActividadEstado } from '../utils/formatActividadEstado'
import { formatActividadFecha } from '../utils/formatActividadFecha'
import {
  ACTIVIDADES_ADMIN_PATHS,
  actividadAdminDetallePath,
} from './actividadesAdminPaths'

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

const INDICATOR_CLASS =
  'activities-indicator-modern group !min-h-[168px] !overflow-hidden !rounded-[22px] !border !border-blue-100 !bg-linear-to-br !from-white !via-white !to-sky-50/60 !p-5 !shadow-[0_10px_24px_rgba(30,90,156,0.08)] !transition-all !duration-300 hover:!-translate-y-1 hover:!border-[#bfe3fa] hover:!shadow-[0_16px_32px_rgba(30,90,156,0.14)]'

const INDICATOR_TOTAL_CLASS =
  INDICATOR_CLASS +
  ' !border-[#93c5fd] !bg-linear-to-br !from-[#eff6ff] !via-white !to-[#e0f2fe]'

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
    <main className="gallery-admin admin-content-modern actividades-admin-reportes">
      <div className="gallery-admin__shell sigasj-stack !gap-6">
        <header className="gallery-admin__header !rounded-[28px] !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/70 !px-8 !py-7 !shadow-[0_14px_38px_rgba(30,90,156,0.10)] md:!px-10">
          <div className="min-w-0 space-y-2">
            <span className="gallery-admin__eyebrow">
              Actividades del Fontanero · Administradora
            </span>
            <h1>Reporte de actividades del Fontanero</h1>
            <p>
              Consulte totales, cantidades por tipo y el detalle de actividades
              registradas.
            </p>
          </div>
          <div className="gallery-admin__header-actions">
            <Link
              to={ACTIVIDADES_ADMIN_PATHS.home}
              className="gallery-admin__link !inline-flex !items-center !justify-center !rounded-2xl !border !border-[#bfe3fa] !bg-white !px-6 !py-3.5 !font-bold !text-[#1e5a9c] !no-underline !shadow-md transition hover:-translate-y-0.5 hover:!bg-[#eaf6ff]"
            >
              Volver al módulo
            </Link>
          </div>
        </header>

        <form
          className="gallery-admin__filters actividades-admin-reportes__filters"
          aria-label="Filtros del reporte"
          onSubmit={handleConsultar}
          noValidate
        >
          <div className="actividades-admin-reportes__section-head col-span-full">
            <p className="actividades-admin-reportes__eyebrow">Consulta</p>
            <h2>Filtrar actividades</h2>
            <p>Defina el periodo, fontanero o tipo para generar el resumen.</p>
          </div>

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
              className="gallery-admin__button gallery-admin__button--primary"
              disabled={loading}
            >
              <IconSearch size={18} aria-hidden="true" />
              {loading ? 'Consultando…' : 'Consultar'}
            </button>
            <button
              type="button"
              className="gallery-admin__button gallery-admin__filter-reset"
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
          className="actividades-admin-reportes__indicators"
          aria-label="Indicadores del reporte"
        >
          <div className="actividades-admin-reportes__section-head">
            <p className="actividades-admin-reportes__eyebrow">Resultados</p>
            <h2>Indicadores de actividades</h2>
            <p>Totales calculados según los filtros aplicados.</p>
          </div>
          <div className="admin-dashboard__indicators-grid actividades-admin-reportes__indicators-grid">
            <IndicatorCard
              title="Total de actividades"
              value={loading ? null : reporte.total}
              isLoading={loading}
              description="Según los filtros aplicados"
              badgeText="Total"
              badgeType="info"
              className={INDICATOR_TOTAL_CLASS}
            />
            {(loading ? [] : reporte.porTipo).map((item) => (
              <IndicatorCard
                key={[item.tipoActividadId ?? 'sin-tipo', item.tipoActividadNombre].join('-')}
                title={item.tipoActividadNombre || 'Sin tipo'}
                value={item.cantidad}
                description="Actividades por tipo"
                badgeText="Tipo"
                badgeType="default"
                className={INDICATOR_CLASS}
              />
            ))}
          </div>
        </section>

        <section
          className="actividades-admin-reportes__listado"
          aria-labelledby="reportes-listado-title"
        >
          <div className="actividades-admin-reportes__section-head">
            <p className="actividades-admin-reportes__eyebrow">Detalle</p>
            <h2 id="reportes-listado-title">Listado de actividades</h2>
            <p>Fecha, responsable, tipo y estado de cada registro.</p>
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
            <div
              className="gallery-admin__empty actividades-admin-reportes__empty"
              role="status"
            >
              <span className="actividades-admin-reportes__empty-icon" aria-hidden="true">
                <IconClipboardOff size={28} />
              </span>
              <h3>Sin actividades encontradas</h3>
              <p>No se encontraron actividades con los filtros seleccionados.</p>
            </div>
          ) : null}

          {!loading && !showEmpty && !filterError ? (
            <div className="table-responsive actividades-admin-reportes__table-shell">
              <table className="actividades-admin-reportes__table">
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Fontanero</th>
                    <th scope="col">Tipo de actividad</th>
                    <th scope="col">Estado</th>
                    <th scope="col">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.actividades.map((actividad) => (
                    <tr key={actividad.id}>
                      <td>{formatActividadFecha(actividad.fechaActividad)}</td>
                      <td>{actividad.fontaneroId}</td>
                      <td>{actividad.tipoActividadNombre || 'Sin tipo'}</td>
                      <td>
                        <span
                          className="actividades-admin-reportes__estado"
                          data-estado={actividad.estado}
                        >
                          {formatActividadEstado(actividad.estado)}
                        </span>
                      </td>
                      <td className="actividades-admin-reportes__row-action">
                        <Link
                          className="actividades-admin-reportes__detail-link"
                          to={actividadAdminDetallePath(actividad.id)}
                        >
                          Ver detalle
                        </Link>
                      </td>
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
