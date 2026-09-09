import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import ActivityFeedback from '../components/ActivityFeedback'
import HistorialActividadCard from '../components/HistorialActividadCard'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { useHistorialActividades } from '../hooks/useHistorialActividades'
import {
  HISTORIAL_PAGE_SIZE,
  hasHistorialPeriodFilter,
  type HistorialActividadesFilters,
} from '../types/actividadHistorial'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'

type DraftFilters = {
  fechaInicio: string
  fechaFin: string
}

const EMPTY_DRAFT: DraftFilters = {
  fechaInicio: '',
  fechaFin: '',
}

const toAppliedFilters = (
  draft: DraftFilters,
  page: number,
): HistorialActividadesFilters => ({
  fechaInicio: draft.fechaInicio.trim() || undefined,
  fechaFin: draft.fechaFin.trim() || undefined,
  page,
  limit: HISTORIAL_PAGE_SIZE,
})

const ActividadesFontaneroHistorialPage = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [draft, setDraft] = useState<DraftFilters>(EMPTY_DRAFT)
  const [applied, setApplied] = useState<HistorialActividadesFilters>({
    page: 1,
    limit: HISTORIAL_PAGE_SIZE,
  })
  const [clientError, setClientError] = useState<string | null>(null)

  const {
    actividades,
    total,
    page,
    totalPages,
    isLoading,
    isError,
    isEmpty,
    isUnauthorized,
    isForbidden,
    errorMessage,
    refetch,
  } = useHistorialActividades(applied)

  const rangeInvalid = useMemo(
    () =>
      Boolean(draft.fechaInicio && draft.fechaFin) &&
      draft.fechaInicio > draft.fechaFin,
    [draft.fechaFin, draft.fechaInicio],
  )

  const hasPeriodFilter = hasHistorialPeriodFilter(applied)

  useEffect(() => {
    if (isUnauthorized) {
      logout()
      navigate('/login', { replace: true })
    }
  }, [isUnauthorized, logout, navigate])

  const handleConsultar = (event: FormEvent) => {
    event.preventDefault()
    setClientError(null)

    if (rangeInvalid) {
      setClientError('La fecha inicial no puede ser posterior a la fecha final.')
      return
    }

    setApplied(toAppliedFilters(draft, 1))
  }

  const handleLimpiar = () => {
    setDraft(EMPTY_DRAFT)
    setClientError(null)
    setApplied({ page: 1, limit: HISTORIAL_PAGE_SIZE })
  }

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return
    }
    setApplied((current) => ({ ...current, page: nextPage }))
  }

  return (
    <section
      className="actividades-fontanero-historial"
      aria-labelledby="historial-actividades-title"
    >
      <header className="actividades-fontanero-historial__header">
        <div>
          <p className="actividades-fontanero-historial__eyebrow">
            Registro de Actividades
          </p>
          <h1 id="historial-actividades-title">Historial de actividades</h1>
          <p className="actividades-fontanero-historial__intro">
            Consulte las actividades finalizadas o revisadas durante la jornada o
            en un periodo específico.
          </p>
        </div>
        {!isLoading && !isError && total > 0 ? (
          <p
            className="actividades-fontanero-historial__count"
            role="status"
            data-testid="historial-total"
          >
            {total} {total === 1 ? 'actividad' : 'actividades'}
          </p>
        ) : null}
      </header>

      <form
        className="actividades-fontanero-historial__filters"
        onSubmit={handleConsultar}
        aria-label="Filtros del historial"
      >
        <div className="actividades-fontanero-historial__filters-row">
          <label className="actividades-fontanero-historial__field">
            <span>Desde</span>
            <input
              type="date"
              value={draft.fechaInicio}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fechaInicio: event.target.value,
                }))
              }
              data-testid="historial-fecha-inicio"
            />
          </label>

          <label className="actividades-fontanero-historial__field">
            <span>Hasta</span>
            <input
              type="date"
              value={draft.fechaFin}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fechaFin: event.target.value,
                }))
              }
              data-testid="historial-fecha-fin"
            />
          </label>
        </div>

        {clientError ? (
          <ActivityFeedback variant="warning" message={clientError} />
        ) : null}

        <div className="actividades-fontanero-historial__filters-actions">
          <button
            type="button"
            className="actividades-fontanero-historial__secondary"
            onClick={handleLimpiar}
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="actividades-fontanero-historial__primary"
            data-testid="historial-consultar"
          >
            Consultar
          </button>
        </div>
      </form>

      {isLoading ? (
        <div
          className="actividades-fontanero-historial__state"
          role="status"
          data-testid="historial-cargando"
        >
          <span className="actividades-fontanero-historial__spinner" aria-hidden="true" />
          Cargando historial de actividades…
        </div>
      ) : null}

      {isForbidden ? (
        <ActivityFeedback
          variant="error"
          message={ACTIVITY_FEEDBACK_MESSAGES.forbidden}
        />
      ) : null}

      {isError && !isForbidden ? (
        <ActivityFeedback
          variant="error"
          message={errorMessage ?? ACTIVITY_FEEDBACK_MESSAGES.loadGeneric}
          action={
            <button
              type="button"
              className="activity-feedback__retry"
              onClick={refetch}
            >
              Reintentar
            </button>
          }
        />
      ) : null}

      {isEmpty ? (
        <div
          className="actividades-fontanero-historial__empty"
          role="status"
          data-testid="historial-lista-vacia"
        >
          <p className="actividades-fontanero-historial__empty-title">
            {hasPeriodFilter
              ? 'No hay actividades en el periodo seleccionado'
              : 'Sin actividades en el historial'}
          </p>
          <p className="actividades-fontanero-historial__empty-text">
            {hasPeriodFilter
              ? 'Pruebe ampliar el rango de fechas o limpiar los filtros.'
              : 'Cuando sus actividades sean aprobadas, rechazadas o corregidas, aparecerán aquí para consulta.'}
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && actividades.length > 0 ? (
        <>
          <div
            className="actividades-fontanero-historial__list"
            role="list"
            aria-label="Historial de actividades"
          >
            {actividades.map((actividad) => (
              <div key={actividad.id} role="listitem">
                <HistorialActividadCard actividad={actividad} />
              </div>
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              className="actividades-fontanero-historial__pagination"
              aria-label="Paginación del historial"
            >
              <button
                type="button"
                className="actividades-fontanero-historial__page-btn"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Anterior
              </button>
              <span
                className="actividades-fontanero-historial__page-info"
                aria-current="page"
              >
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                className="actividades-fontanero-historial__page-btn"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
                data-testid="historial-pagina-siguiente"
              >
                Siguiente
              </button>
            </nav>
          ) : null}
        </>
      ) : null}

      <Link
        to={ACTIVIDADES_FONTANERO_PATHS.home}
        className="actividades-fontanero-historial__back"
      >
        Volver al menú de actividades
      </Link>
    </section>
  )
}

export default ActividadesFontaneroHistorialPage
