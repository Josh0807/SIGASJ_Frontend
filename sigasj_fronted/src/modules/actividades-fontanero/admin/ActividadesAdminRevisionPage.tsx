import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/routePaths'
import ActivityFeedback from '../components/ActivityFeedback'
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

const PRIMARY_ACTION_CLASS =
  'gallery-admin__button gallery-admin__button--primary !rounded-2xl !border-0 !bg-gradient-to-r !from-blue-600 !to-sky-500 !px-7 !py-3.5 !font-bold !text-white !shadow-lg !shadow-blue-200'

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
    void getReportesAdmin({}).then((reporte) => {
      if (active) {
        setFontaneros(
          reporte.porFontanero
            .map((item) => item.fontaneroId)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'es')),
        )
      }
    }).catch(() => undefined)
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    void getActividadesAdmin(filters)
      .then((result) => {
        if (!active) return
        setActividades(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages ?? 1)
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
          setError(interpreted.message)
        }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
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

  return (
    <main className="gallery-admin actividades-admin-revision">
      <div className="gallery-admin__shell sigasj-stack !gap-7">
        <header className="gallery-admin__header !rounded-[28px] !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/70 !px-8 !py-8 !shadow-[0_14px_38px_rgba(30, 90, 156,0.10)] md:!px-10">
          <div className="min-w-0 space-y-3">
            <span className="gallery-admin__eyebrow">Actividades del Fontanero · Administradora</span>
            <h1>Revisión de actividades</h1>
            <p>Consulte la información reportada y confirme las actividades correctas.</p>
          </div>
          <Link className="gallery-admin__link !inline-flex !items-center !justify-center !rounded-2xl !border !border-[#bfe3fa] !bg-white !px-6 !py-3.5 !font-bold !text-[#1e5a9c] !no-underline !shadow-md transition hover:-translate-y-0.5 hover:!bg-[#eaf6ff]" to={ACTIVIDADES_ADMIN_PATHS.reportes}>Ver reportes</Link>
        </header>

        <form className="gallery-admin__filters actividades-admin-revision__filters !rounded-[28px] !border-blue-100 !bg-white/90 !p-7 !shadow-[0_14px_38px_rgba(30, 90, 156,0.08)]" onSubmit={search} aria-label="Filtros de actividades">
          <div className="col-span-full border-b border-blue-100 pb-5"><p className="mb-1 text-sm font-black uppercase tracking-[0.12em] text-[#1e5a9c]">Consulta de actividades</p><h2 className="m-0 text-2xl font-black tracking-tight text-[#07376f]">Buscar actividades registradas</h2><p className="mt-2 text-base text-slate-500">Seleccione los criterios para revisar los registros enviados.</p></div>
          <label className="gallery-admin__field"><span>Fontanero</span><select value={draft.fontaneroId} onChange={(e) => setDraft({ ...draft, fontaneroId: e.target.value })}><option value="">Todos</option>{fontaneros.map((id) => <option key={id} value={id}>{id}</option>)}</select></label>
          <label className="gallery-admin__field"><span>Actividad</span><select disabled={tiposLoading} value={draft.tipoActividadId} onChange={(e) => setDraft({ ...draft, tipoActividadId: e.target.value })}><option value="">Todas</option>{tipoOptions.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}</select></label>
          <label className="gallery-admin__field"><span>Estado</span><select value={draft.estado} onChange={(e) => setDraft({ ...draft, estado: e.target.value })}><option value="">Todos</option><option value="REPORTADA">Pendiente</option><option value="REVISADA">Revisada</option><option value="REQUIERE_CORRECCION">Requiere corrección</option></select></label>
          <label className="gallery-admin__field"><span>Desde</span><input type="date" value={draft.fechaInicio} onChange={(e) => setDraft({ ...draft, fechaInicio: e.target.value })} /></label>
          <label className="gallery-admin__field"><span>Hasta</span><input type="date" value={draft.fechaFin} onChange={(e) => setDraft({ ...draft, fechaFin: e.target.value })} /></label>
          <div className="actividades-admin-revision__filter-actions"><button className={PRIMARY_ACTION_CLASS} disabled={loading}>Buscar</button><button type="button" className="gallery-admin__button !rounded-2xl !border-[#bfe3fa] !bg-white !px-6 !py-3.5 !font-bold !text-[#1e5a9c] !shadow-md" onClick={clear} disabled={loading}>Limpiar filtros</button></div>
        </form>

        {error ? (
          <ActivityFeedback
            variant="error"
            message={error}
            action={
              <button
                className="activity-feedback__retry"
                type="button"
                onClick={() => {
                  setLoading(true)
                  setError(null)
                  setReloadKey((key) => key + 1)
                }}
              >
                Reintentar
              </button>
            }
          />
        ) : null}

        <section
          className="actividades-admin-revision__list !rounded-[28px] !border !border-blue-100 !bg-white/90 !p-7 !shadow-[0_14px_38px_rgba(30, 90, 156,0.08)]"
          aria-label="Actividades registradas"
        >
          {!loading && !error ? (
            <div className="actividades-admin-revision__summary">
              <strong>{total}</strong> actividades encontradas
            </div>
          ) : null}
          {loading ? (
            <div
              className="gallery-admin__skeleton"
              aria-busy="true"
              aria-label="Cargando actividades"
            >
              <div className="gallery-admin__skeleton-row" />
              <div className="gallery-admin__skeleton-row" />
              <div className="gallery-admin__skeleton-row" />
            </div>
          ) : null}
          {!loading && !error && actividades.length === 0 ? (
            <div className="gallery-admin__empty" role="status">
              <p>No se encontraron actividades con los filtros seleccionados.</p>
            </div>
          ) : null}
          {!loading && !error && actividades.length > 0 ? (
            <ul className="actividades-fontanero-historial__list m-0 list-none p-0">
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
                      <Link
                        className="actividad-historial-card__action"
                        to={actividadAdminDetallePath(actividad.id)}
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : null}
          {!loading && totalPages > 1 ? (
            <nav
              className="gallery-admin__pagination"
              aria-label="Paginación de actividades"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  setLoading(true)
                  setFilters({ ...filters, page: page - 1 })
                }}
              >
                Anterior
              </button>
              <p>
                Página {page} de {totalPages}
              </p>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  setLoading(true)
                  setFilters({ ...filters, page: page + 1 })
                }}
              >
                Siguiente
              </button>
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default ActividadesAdminRevisionPage
