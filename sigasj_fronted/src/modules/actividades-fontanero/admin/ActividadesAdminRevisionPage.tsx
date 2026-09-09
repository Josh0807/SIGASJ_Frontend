import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/routePaths'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import ActivityFeedback from '../components/ActivityFeedback'
import DetalleActividad from '../components/DetalleActividad'
import { clearAccessToken } from '../../auth/utils/authStorage'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { interpretActividadApiError } from '../utils/interpretActividadApiError'
import { useTiposActividadFontanero } from '../hooks/useTiposActividadFontanero'
import {
  getActividadesAdmin,
  getActividadAdminDetalle,
  getReportesAdmin,
  revisarActividadAdmin,
  solicitarCorreccionAdmin,
  type AdminActividadesFilters,
} from '../services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { formatActividadFecha } from '../utils/formatActividadFecha'
import { ACTIVIDADES_ADMIN_PATHS } from './actividadesAdminPaths'

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
  const [selected, setSelected] = useState<ActividadFontaneroRegistrada | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [confirmReview, setConfirmReview] = useState(false)
  const [confirmCorrection, setConfirmCorrection] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [requestingCorrection, setRequestingCorrection] = useState(false)
  const [correctionNote, setCorrectionNote] = useState('')
  const [correctionError, setCorrectionError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [fontaneros, setFontaneros] = useState<string[]>([])
  const { tipos, isLoading: tiposLoading } = useTiposActividadFontanero()

  const busy = reviewing || requestingCorrection

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
    setNotice(null)
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
    setNotice(null)
    setLoading(true)
    setFilters(toFilters(EMPTY_FILTERS))
  }

  const markReviewed = async () => {
    if (!selected || selected.estado === 'REVISADA' || busy) return
    setReviewing(true)
    setConfirmReview(false)
    setError(null)
    try {
      const updated = await revisarActividadAdmin(selected.id)
      setActividades((current) =>
        current.map((item) => item.id === updated.id ? { ...item, ...updated } : item),
      )
      setSelected((current) => current?.id === updated.id ? { ...current, ...updated } : current)
      setNotice(ACTIVITY_FEEDBACK_MESSAGES.successReview)
    } catch (caught) {
      const interpreted = interpretActividadApiError(caught)
      if (interpreted.kind === 'unauthorized') {
        clearAccessToken()
        setUnauthorized(true)
      } else if (interpreted.kind === 'forbidden') {
        setForbidden(true)
      } else {
        setError(interpreted.message)
      }
    } finally {
      setReviewing(false)
    }
  }

  const requestCorrection = async () => {
    if (!selected || busy) return
    const observacion = correctionNote.trim()
    if (!observacion) {
      setCorrectionError('Indique la observación de corrección.')
      setConfirmCorrection(false)
      return
    }
    if (observacion.length > 2000) {
      setCorrectionError('La observación no puede superar 2000 caracteres.')
      setConfirmCorrection(false)
      return
    }
    setRequestingCorrection(true)
    setConfirmCorrection(false)
    setCorrectionError(null)
    setError(null)
    try {
      const updated = await solicitarCorreccionAdmin(selected.id, observacion)
      setActividades((current) =>
        current.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
      )
      setSelected((current) =>
        current?.id === updated.id ? { ...current, ...updated } : current,
      )
      setCorrectionNote('')
      setNotice(ACTIVITY_FEEDBACK_MESSAGES.successCorrectionRequest)
    } catch (caught) {
      const interpreted = interpretActividadApiError(caught)
      if (interpreted.kind === 'unauthorized') {
        clearAccessToken()
        setUnauthorized(true)
      } else if (interpreted.kind === 'forbidden') {
        setForbidden(true)
      } else {
        setCorrectionError(interpreted.message)
      }
    } finally {
      setRequestingCorrection(false)
    }
  }

  const openDetail = async (actividad: ActividadFontaneroRegistrada) => {
    setSelected(actividad)
    setDetailLoading(true)
    setDetailError(null)
    setNotice(null)
    setCorrectionNote('')
    setCorrectionError(null)
    setConfirmCorrection(false)
    try {
      const detalle = await getActividadAdminDetalle(actividad.id)
      setSelected(detalle)
    } catch (caught) {
      const interpreted = interpretActividadApiError(caught, {
        notFoundMessage: ACTIVITY_FEEDBACK_MESSAGES.notFound,
      })
      if (interpreted.kind === 'unauthorized') {
        clearAccessToken()
        setUnauthorized(true)
      } else if (interpreted.kind === 'forbidden') {
        setForbidden(true)
      } else {
        setDetailError(interpreted.message)
      }
    } finally {
      setDetailLoading(false)
    }
  }

  const canReview =
    !detailLoading &&
    !detailError &&
    selected != null &&
    selected.estadoRevision !== 'REVISADA' &&
    selected.estado !== 'REVISADA'

  const canRequestCorrection =
    !detailLoading &&
    !detailError &&
    selected != null &&
    selected.estado !== 'REQUIERE_CORRECCION' &&
    selected.estado !== 'REVISADA'

  return (
    <main className="gallery-admin actividades-admin-revision">
      <div className="gallery-admin__shell">
        <header className="gallery-admin__header">
          <div>
            <span className="gallery-admin__eyebrow">Actividades del Fontanero · Administradora</span>
            <h1>Revisión de actividades</h1>
            <p>Consulte la información reportada y confirme las actividades correctas.</p>
          </div>
          <Link className="gallery-admin__link" to={ACTIVIDADES_ADMIN_PATHS.reportes}>Ver reportes</Link>
        </header>

        <form className="gallery-admin__filters actividades-admin-revision__filters" onSubmit={search} aria-label="Filtros de actividades">
          <label className="gallery-admin__field"><span>Fontanero</span><select value={draft.fontaneroId} onChange={(e) => setDraft({ ...draft, fontaneroId: e.target.value })}><option value="">Todos</option>{fontaneros.map((id) => <option key={id} value={id}>{id}</option>)}</select></label>
          <label className="gallery-admin__field"><span>Actividad</span><select disabled={tiposLoading} value={draft.tipoActividadId} onChange={(e) => setDraft({ ...draft, tipoActividadId: e.target.value })}><option value="">Todas</option>{tipoOptions.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}</select></label>
          <label className="gallery-admin__field"><span>Estado</span><select value={draft.estado} onChange={(e) => setDraft({ ...draft, estado: e.target.value })}><option value="">Todos</option><option value="REPORTADA">Pendiente</option><option value="REVISADA">Revisada</option><option value="REQUIERE_CORRECCION">Requiere corrección</option></select></label>
          <label className="gallery-admin__field"><span>Desde</span><input type="date" value={draft.fechaInicio} onChange={(e) => setDraft({ ...draft, fechaInicio: e.target.value })} /></label>
          <label className="gallery-admin__field"><span>Hasta</span><input type="date" value={draft.fechaFin} onChange={(e) => setDraft({ ...draft, fechaFin: e.target.value })} /></label>
          <div className="actividades-admin-revision__filter-actions"><button className="gallery-admin__button gallery-admin__button--primary" disabled={loading}>Buscar</button><button type="button" className="gallery-admin__button" onClick={clear} disabled={loading}>Limpiar filtros</button></div>
        </form>

        {notice ? (
          <ActivityFeedback
            variant="success"
            message={notice || ACTIVITY_FEEDBACK_MESSAGES.successReview}
            dismissible
            onDismiss={() => setNotice(null)}
            testId="admin-revision-exito"
          />
        ) : null}
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

        <section className="actividades-admin-revision__list" aria-label="Actividades registradas">
          {!loading && !error ? <div className="actividades-admin-revision__summary"><strong>{total}</strong> actividades encontradas</div> : null}
          {loading ? <div className="gallery-admin__skeleton" aria-busy="true" aria-label="Cargando actividades"><div className="gallery-admin__skeleton-row" /><div className="gallery-admin__skeleton-row" /><div className="gallery-admin__skeleton-row" /></div> : null}
          {!loading && !error && actividades.length === 0 ? <div className="gallery-admin__empty" role="status"><p>No se encontraron actividades con los filtros seleccionados.</p></div> : null}
          {!loading && !error && actividades.length > 0 ? <div className="table-responsive"><table className="actividades-admin-revision__table"><thead><tr><th>Fecha</th><th>Fontanero</th><th>Tipo de actividad</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{actividades.map((actividad) => <tr key={actividad.id}><td data-label="Fecha">{formatActividadFecha(actividad.fechaActividad)}</td><td data-label="Fontanero">{displayFontanero(actividad)}</td><td data-label="Actividad">{actividad.tipoActividadNombre || actividad.titulo}</td><td data-label="Estado"><span className={`actividades-admin-revision__status is-${actividad.estado.toLowerCase()}`}>{displayEstado(actividad.estado)}</span></td><td data-label="Acción"><button className="gallery-admin__button" type="button" onClick={() => void openDetail(actividad)}>Ver detalle</button></td></tr>)}</tbody></table></div> : null}
          {!loading && totalPages > 1 ? <nav className="gallery-admin__pagination" aria-label="Paginación de actividades"><button type="button" disabled={page <= 1} onClick={() => { setLoading(true); setFilters({ ...filters, page: page - 1 }) }}>Anterior</button><p>Página {page} de {totalPages}</p><button type="button" disabled={page >= totalPages} onClick={() => { setLoading(true); setFilters({ ...filters, page: page + 1 }) }}>Siguiente</button></nav> : null}
        </section>
      </div>

      {selected ? (
        <div
          className="actividades-admin-revision__overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) setSelected(null)
          }}
        >
          <div className="actividades-admin-revision__detail" role="dialog" aria-modal="true">
            <DetalleActividad
              actividad={selected}
              loading={detailLoading}
              error={detailError}
              showFontanero
              onBack={() => setSelected(null)}
              backLabel="Cerrar"
              actions={
                <div className="actividades-admin-revision__detail-actions">
                  <button
                    type="button"
                    className="gallery-admin__button gallery-admin__button--primary"
                    disabled={!canReview || busy}
                    onClick={() => setConfirmReview(true)}
                  >
                    {!canReview
                      ? 'Actividad revisada'
                      : reviewing
                        ? 'Marcando…'
                        : 'Marcar como revisada'}
                  </button>
                  {canRequestCorrection ? (
                    <div className="actividades-admin-revision__correction">
                      <label className="gallery-admin__field" htmlFor="admin-correction-note">
                        <span>Observación para corrección</span>
                        <textarea
                          id="admin-correction-note"
                          rows={3}
                          maxLength={2000}
                          value={correctionNote}
                          disabled={busy}
                          placeholder="Indique qué debe corregir el fontanero"
                          onChange={(event) => {
                            setCorrectionNote(event.target.value)
                            setCorrectionError(null)
                          }}
                        />
                      </label>
                      {correctionError ? (
                        <ActivityFeedback
                          variant="error"
                          message={correctionError}
                          testId="admin-correction-error"
                        />
                      ) : null}
                      <button
                        type="button"
                        className="gallery-admin__button"
                        disabled={busy || !correctionNote.trim()}
                        onClick={() => setConfirmCorrection(true)}
                      >
                        {requestingCorrection
                          ? 'Solicitando…'
                          : 'Solicitar corrección'}
                      </button>
                    </div>
                  ) : null}
                </div>
              }
            />
          </div>
        </div>
      ) : null}
      <ConfirmDialog
        isOpen={confirmReview}
        title="Confirmar revisión"
        message="¿Confirma que verificó la información y desea marcar esta actividad como revisada? Esta acción no modifica los datos reportados por el Fontanero."
        confirmLabel="Sí, marcar como revisada"
        onCancel={() => setConfirmReview(false)}
        onConfirm={() => void markReviewed()}
      />
      <ConfirmDialog
        isOpen={confirmCorrection}
        title="Solicitar corrección"
        message="¿Confirma que desea solicitar la corrección de esta actividad? El fontanero deberá corregirla con la observación indicada."
        confirmLabel="Sí, solicitar corrección"
        onCancel={() => setConfirmCorrection(false)}
        onConfirm={() => void requestCorrection()}
      />
    </main>
  )
}

export default ActividadesAdminRevisionPage
