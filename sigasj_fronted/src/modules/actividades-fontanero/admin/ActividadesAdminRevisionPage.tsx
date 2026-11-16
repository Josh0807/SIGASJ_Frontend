import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  IconChevronLeft,
  IconChevronRight,
  IconClipboardList,
  IconFilterOff,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/routePaths'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
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
import { clearAccessToken } from '../../auth/utils/authStorage'
import { interpretActividadApiError } from '../utils/interpretActividadApiError'
import { useTiposActividadFontanero } from '../hooks/useTiposActividadFontanero'
import {
  getActividadesAdmin,
  getReportesAdmin,
  type AdminActividadesFilters,
} from '../services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { formatPeriodoActividadPartes } from '../utils/formatActividadFecha'
import {
  ACTIVIDADES_ADMIN_PATHS,
  actividadAdminDetallePath,
} from './actividadesAdminPaths'

const PAGE_SIZE = 10

type DraftFilters = {
  fontaneroId: string
  tipoActividadId: string
  estado: string
  fechaInicio: string
  fechaFin: string
}

const EMPTY_FILTERS: DraftFilters = {
  fontaneroId: '',
  tipoActividadId: '',
  estado: '',
  fechaInicio: '',
  fechaFin: '',
}

const displayFontanero = (actividad: ActividadFontaneroRegistrada) =>
  actividad.fontaneroNombre || actividad.fontaneroId || 'Sin identificar'

const MetaResumen = ({ actividad }: { actividad: ActividadFontaneroRegistrada }) => {
  const periodo = formatPeriodoActividadPartes(actividad)
  return (
    <dl className="actividad-historial-card__meta actividad-historial-card__meta--admin">
      <div className="actividad-historial-card__meta-item">
        <dt>Fecha</dt>
        <dd>{periodo.fecha}</dd>
      </div>
      <div className="actividad-historial-card__meta-item">
        <dt>Hora</dt>
        <dd>{periodo.hora}</dd>
      </div>
      <div className="actividad-historial-card__meta-item">
        <dt>Fontanero</dt>
        <dd>{displayFontanero(actividad)}</dd>
      </div>
    </dl>
  )
}

const displayEstado = (estado: string) => {
  const labels: Record<string, string> = {
    REPORTADA: 'Pendiente',
    REVISADA: 'Revisada',
    REQUIERE_CORRECCION: 'Requiere corrección',
    CORREGIDA: 'Corregida',
  }
  return labels[estado] ?? (estado || 'Sin estado')
}

const toFilters = (draft: DraftFilters, page = 1): AdminActividadesFilters => ({
  fontaneroId: draft.fontaneroId || undefined,
  tipoActividadId: draft.tipoActividadId ? Number(draft.tipoActividadId) : undefined,
  estado: draft.estado || undefined,
  fechaInicio: draft.fechaInicio || undefined,
  fechaFin: draft.fechaFin || undefined,
  page,
  limit: PAGE_SIZE,
})

const ActividadesAdminRevisionPage = () => {
  const [draft, setDraft] = useState(EMPTY_FILTERS)
  const [filters, setFilters] = useState<AdminActividadesFilters>(() =>
    toFilters(EMPTY_FILTERS),
  )
  const [actividades, setActividades] = useState<ActividadFontaneroRegistrada[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unauthorized, setUnauthorized] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [fontaneros, setFontaneros] = useState<string[]>([])
  const { tipos, isLoading: tiposLoading } = useTiposActividadFontanero()

  useEffect(() => {
    let active = true
    void getReportesAdmin({})
      .then((reporte) => {
        if (active) {
          setFontaneros(
            reporte.porFontanero
              .map((item) => item.fontaneroId)
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b, 'es')),
          )
        }
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    void getActividadesAdmin(filters)
      .then((result) => {
        if (!active) return
        setActividades(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages ?? 1)
        setError(null)
      })
      .catch((caught) => {
        if (!active) return
        const interpreted = interpretActividadApiError(caught)
        if (interpreted.kind === 'unauthorized') {
          clearAccessToken()
          setUnauthorized(true)
        } else if (interpreted.kind === 'forbidden') {
          setForbidden(true)
        } else {
          setError(
            interpreted.message ||
              ADMIN_COPY.loadError('las actividades registradas'),
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [filters, reloadKey])

  const page = filters.page ?? 1
  const tipoOptions = useMemo(
    () => [...tipos].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [tipos],
  )

  if (unauthorized) return <Navigate to={LOGIN_ROUTE_PATH} replace />
  if (forbidden) return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />

  const search = (event: FormEvent) => {
    event.preventDefault()
    if (draft.fechaInicio && draft.fechaFin && draft.fechaInicio > draft.fechaFin) {
      setError('La fecha inicial no puede ser posterior a la fecha final.')
      return
    }
    setError(null)
    setLoading(true)
    setFilters(toFilters(draft))
  }

  const clear = () => {
    setDraft(EMPTY_FILTERS)
    setError(null)
    setLoading(true)
    setFilters(toFilters(EMPTY_FILTERS))
  }

  const hayFiltros = Boolean(
    draft.fontaneroId ||
      draft.tipoActividadId ||
      draft.estado ||
      draft.fechaInicio ||
      draft.fechaFin,
  )

  return (
    <AdminShell
      className="actividades-admin-revision gap-5 sm:gap-6"
      aria-labelledby="actividades-admin-revision-title"
    >
      <PageHeader
        id="actividades-admin-revision-title"
        eyebrow="Actividades del Fontanero · Administradora"
        title={
          <span className="inline-flex items-center gap-2">
            <IconClipboardList size={22} aria-hidden="true" />
            Revisión de actividades
          </span>
        }
        description="Consulte la información reportada y confirme las actividades correctas."
        actions={
          <Button to={ACTIVIDADES_ADMIN_PATHS.reportes} variant="secondary">
            Ver reportes
          </Button>
        }
      />

      <form onSubmit={search}>
      <AdminFilters
        aria-label="Filtros de actividades"
        summary={
          !loading && !error ? (
            <>
              <strong className="text-sigasj-ink">{total}</strong>
              <span>{total === 1 ? 'actividad' : 'actividades'}</span>
            </>
          ) : null
        }
      >
        <AdminFilterField label="Fontanero">
          <select
            className={adminFilterControlClassName}
            value={draft.fontaneroId}
            onChange={(e) => setDraft({ ...draft, fontaneroId: e.target.value })}
          >
            <option value="">Todos</option>
            {fontaneros.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="Actividad">
          <select
            className={adminFilterControlClassName}
            disabled={tiposLoading}
            value={draft.tipoActividadId}
            onChange={(e) => setDraft({ ...draft, tipoActividadId: e.target.value })}
          >
            <option value="">Todas</option>
            {tipoOptions.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="Estado">
          <select
            className={adminFilterControlClassName}
            value={draft.estado}
            onChange={(e) => setDraft({ ...draft, estado: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="REPORTADA">Pendiente</option>
            <option value="REVISADA">Revisada</option>
            <option value="REQUIERE_CORRECCION">Requiere corrección</option>
          </select>
        </AdminFilterField>
        <AdminFilterField label="Desde">
          <input
            type="date"
            className={adminFilterControlClassName}
            value={draft.fechaInicio}
            onChange={(e) => setDraft({ ...draft, fechaInicio: e.target.value })}
          />
        </AdminFilterField>
        <AdminFilterField label="Hasta">
          <input
            type="date"
            className={adminFilterControlClassName}
            value={draft.fechaFin}
            onChange={(e) => setDraft({ ...draft, fechaFin: e.target.value })}
          />
        </AdminFilterField>
        <div className="col-span-full flex flex-wrap gap-2">
          <Button
            type="submit"
            variant="primary"
            leftIcon={<IconSearch size={17} aria-hidden="true" />}
            loading={loading}
          >
            Buscar
          </Button>
          <Button
            type="button"
            variant="secondary"
            leftIcon={<IconFilterOff size={17} aria-hidden="true" />}
            onClick={clear}
            disabled={loading || !hayFiltros}
          >
            Limpiar filtros
          </Button>
        </div>
      </AdminFilters>
      </form>

      {error ? (
        <Alert tone="danger">
          <div className="grid gap-3">
            <p className="m-0 font-semibold">{error}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="justify-self-start"
              leftIcon={<IconRefresh size={16} aria-hidden="true" />}
              onClick={() => {
                setLoading(true)
                setError(null)
                setReloadKey((key) => key + 1)
              }}
            >
              {ADMIN_COPY.retry}
            </Button>
          </div>
        </Alert>
      ) : null}

      <Card
        as="section"
        padded
        className="actividades-admin-revision__list !gap-4"
        aria-label="Actividades registradas"
      >
        {loading ? (
          <Alert tone="info">{ADMIN_COPY.loading('actividades')}</Alert>
        ) : actividades.length === 0 ? (
          <EmptyState
            title={ADMIN_COPY.emptyFiltered('actividades')}
            actions={
              hayFiltros ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<IconFilterOff size={16} aria-hidden="true" />}
                  onClick={clear}
                >
                  Limpiar filtros
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="actividades-fontanero-historial__list m-0 list-none gap-3 p-0 grid">
            {actividades.map((actividad) => (
              <li key={actividad.id}>
                <article
                  className="actividad-historial-card actividad-historial-card--admin"
                  aria-labelledby={`admin-actividad-${actividad.id}`}
                >
                  <header className="actividad-historial-card__header">
                    <div className="actividad-historial-card__heading">
                      <p className="actividad-historial-card__tipo">
                        {actividad.tipoActividadNombre || 'Sin tipo'}
                      </p>
                      <h2
                        id={`admin-actividad-${actividad.id}`}
                        className="actividad-historial-card__titulo"
                      >
                        {actividad.titulo}
                      </h2>
                    </div>
                    <span
                      className="actividad-historial-card__estado"
                      data-estado={actividad.estado}
                    >
                      {displayEstado(actividad.estado)}
                    </span>
                  </header>
                  <div className="actividad-historial-card__body">
                    <MetaResumen actividad={actividad} />
                    <Button
                      to={actividadAdminDetallePath(actividad.id)}
                      variant="secondary"
                      size="sm"
                      className="actividad-historial-card__action"
                    >
                      Ver detalle
                    </Button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        {!loading && totalPages > 1 ? (
          <nav
            className="flex flex-col items-center justify-between gap-3 border-t border-sigasj-border pt-4 text-sm text-sigasj-muted sm:flex-row"
            aria-label="Paginación de actividades"
          >
            <p className="m-0 font-semibold">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<IconChevronLeft size={16} aria-hidden="true" />}
                disabled={page <= 1}
                onClick={() => {
                  setLoading(true)
                  setFilters({ ...filters, page: page - 1 })
                }}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                rightIcon={<IconChevronRight size={16} aria-hidden="true" />}
                disabled={page >= totalPages}
                onClick={() => {
                  setLoading(true)
                  setFilters({ ...filters, page: page + 1 })
                }}
              >
                Siguiente
              </Button>
            </div>
          </nav>
        ) : null}
      </Card>
    </AdminShell>
  )
}

export default ActividadesAdminRevisionPage