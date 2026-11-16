import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  IconChartBar,
  IconClipboardOff,
  IconFilterOff,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import IndicatorCard from '../../../shared/components/IndicatorCard'
import {
  AdminFilterField,
  AdminFilters,
  AdminShell,
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
  adminFilterControlClassName,
} from '../../../shared/ui'
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
  'activities-indicator-modern group min-h-[168px]'

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
    <AdminShell
      className="actividades-admin-reportes gap-5 sm:gap-6"
      aria-labelledby="actividades-admin-reportes-title"
    >
      <PageHeader
        id="actividades-admin-reportes-title"
        eyebrow="Actividades del Fontanero · Administradora"
        title={
          <span className="inline-flex items-center gap-2">
            <IconChartBar size={22} aria-hidden="true" />
            Reporte de actividades del Fontanero
          </span>
        }
        description="Totales, cantidades por tipo y detalle de las actividades registradas en campo."
        actions={
          <Button to={ACTIVIDADES_ADMIN_PATHS.home} variant="secondary">
            Volver al módulo
          </Button>
        }
      />

      <form onSubmit={handleConsultar} noValidate>
        <AdminFilters aria-label="Filtros del reporte">
          <AdminFilterField label="Fecha inicial">
            <input
              id="reportes-fecha-inicio"
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
              id="reportes-fecha-fin"
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

          <AdminFilterField label="Fontanero">
            <select
              id="reportes-fontanero"
              className={adminFilterControlClassName}
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
          </AdminFilterField>

          <AdminFilterField label="Tipo de actividad">
            <select
              id="reportes-tipo"
              className={adminFilterControlClassName}
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
          </AdminFilterField>

          <div className="col-span-full flex flex-wrap gap-2">
            <Button
              type="submit"
              variant="primary"
              leftIcon={<IconSearch size={17} aria-hidden="true" />}
              loading={loading}
            >
              {loading ? 'Consultando…' : 'Consultar'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              leftIcon={<IconFilterOff size={17} aria-hidden="true" />}
              onClick={handleLimpiar}
              disabled={
                loading || (!hasActiveDraft && Object.keys(applied).length === 0)
              }
            >
              Limpiar filtros
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
              leftIcon={<IconRefresh size={16} aria-hidden="true" />}
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
          className="actividades-admin-reportes__indicators grid gap-4"
          aria-label="Indicadores del reporte"
        >
          <h2 className="m-0 text-lg font-extrabold text-sigasj-ink">
            Indicadores de actividades
          </h2>
          <div className="admin-dashboard__indicators-grid actividades-admin-reportes__indicators-grid">
            <IndicatorCard
              title="Total de actividades"
              value={loading ? null : reporte.total}
              isLoading={loading}
              description="Según los filtros aplicados"
              badgeText="Total"
              badgeType="info"
              className={INDICATOR_CLASS}
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

        <Card
          as="section"
          padded
          className="actividades-admin-reportes__listado !gap-4"
          aria-labelledby="reportes-listado-title"
        >
          <h2
            id="reportes-listado-title"
            className="m-0 text-lg font-extrabold text-sigasj-ink"
          >
            Listado de actividades
          </h2>

          {loading ? (
            <Alert tone="info">{ADMIN_COPY.loading('el reporte')}</Alert>
          ) : null}

          {showEmpty ? (
            <EmptyState
              icon={<IconClipboardOff size={28} aria-hidden="true" />}
              title={ADMIN_COPY.emptyFiltered('actividades')}
            />
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
                        <Button
                          to={actividadAdminDetallePath(actividad.id)}
                          variant="secondary"
                          size="sm"
                        >
                          Ver detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>
    </AdminShell>
  )
}

export default ActividadesAdminReportesPage
