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
import { IconArrowLeft, IconCalendarSearch, IconEraser, IconSearch } from '@tabler/icons-react'

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
      className="actividades-fontanero-historial !mx-0 !max-w-none !gap-7"
      aria-labelledby="historial-actividades-title"
    >
      <header className="actividades-fontanero-historial__header !rounded-[28px] !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/70 !px-8 !py-8 !shadow-[0_14px_38px_rgba(30,90,156,0.10)] md:!px-10">
        <div className="min-w-0 space-y-3">
          <p className="actividades-fontanero-historial__eyebrow !m-0 !text-sm !font-black !tracking-[0.12em] !text-blue-600">
            Registro de Actividades
          </p>
          <h1 id="historial-actividades-title" className="!m-0 !text-3xl !font-black !tracking-tight !text-[#07376f] md:!text-4xl">Historial de actividades</h1>
          <p className="actividades-fontanero-historial__intro !m-0 !text-lg !leading-relaxed !text-slate-500">
            Consulte las actividades finalizadas o revisadas durante la jornada o
            en un periodo específico.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-3 lg:items-end">
          <Link to={ACTIVIDADES_FONTANERO_PATHS.home} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 font-bold !no-underline text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:bg-blue-50 hover:!no-underline">
            <IconArrowLeft size={20} aria-hidden="true" />
            Volver al menú de actividades
          </Link>
        {!isLoading && !isError && total > 0 ? (
          <p
            className="actividades-fontanero-historial__count"
            role="status"
            data-testid="historial-total"
          >
            {total} {total === 1 ? 'actividad' : 'actividades'}
          </p>
        ) : null}
        </div>
      </header>

      <form
        className="actividades-fontanero-historial__filters !rounded-[28px] !border-blue-100 !bg-white/90 !p-6 !shadow-[0_14px_38px_rgba(30,90,156,0.08)] md:!p-8"
        onSubmit={handleConsultar}
        aria-label="Filtros del historial"
      >
        <div className="border-b border-blue-100 pb-5">
          <p className="mb-1 text-sm font-black uppercase tracking-[0.12em] text-blue-600">Consulta del historial</p>
          <h2 className="m-0 text-2xl font-black tracking-tight text-[#07376f]">Filtrar por periodo</h2>
          <p className="mt-2 text-base text-slate-500">Seleccione un rango de fechas para consultar sus actividades.</p>
        </div>
        <div className="actividades-fontanero-historial__filters-row">
          <label className="actividades-fontanero-historial__field">
            <span className="text-sm font-black uppercase tracking-[0.08em] text-blue-700">Desde</span>
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
              className="!min-h-14 !rounded-2xl !border-blue-200 !bg-white !px-4 !shadow-sm focus:!border-blue-500 focus:!outline-none focus:!ring-4 focus:!ring-blue-100"
            />
          </label>

          <label className="actividades-fontanero-historial__field">
            <span className="text-sm font-black uppercase tracking-[0.08em] text-blue-700">Hasta</span>
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
              className="!min-h-14 !rounded-2xl !border-blue-200 !bg-white !px-4 !shadow-sm focus:!border-blue-500 focus:!outline-none focus:!ring-4 focus:!ring-blue-100"
            />
          </label>
        </div>

        {clientError ? (
          <ActivityFeedback variant="warning" message={clientError} />
        ) : null}

        <div className="actividades-fontanero-historial__filters-actions">
          <button
            type="button"
            className="actividades-fontanero-historial__secondary !order-2 !inline-flex !items-center !gap-2 !rounded-2xl !border-blue-200 !bg-white !px-6 !py-3.5 !font-bold !text-blue-700 !shadow-md transition hover:!-translate-y-0.5 hover:!bg-blue-50"
            onClick={handleLimpiar}
          >
            <IconEraser size={20} aria-hidden="true" /> Limpiar
          </button>
          <button
            type="submit"
            className="actividades-fontanero-historial__primary !order-1 !inline-flex !items-center !gap-2 !rounded-2xl !border-0 !bg-gradient-to-r !from-blue-600 !to-sky-500 !px-7 !py-3.5 !font-bold !text-white !shadow-lg !shadow-blue-200 transition hover:-translate-y-0.5 hover:!from-blue-700 hover:!to-sky-600"
            data-testid="historial-consultar"
          >
            <IconSearch size={20} aria-hidden="true" /> Consultar
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
          className="actividades-fontanero-historial__empty !rounded-[28px] !border !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/60 !p-8 !shadow-[0_12px_32px_rgba(30,90,156,0.08)]"
          role="status"
          data-testid="historial-lista-vacia"
        >
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><IconCalendarSearch size={28} aria-hidden="true" /></span>
          <p className="actividades-fontanero-historial__empty-title !text-xl !font-black !text-[#07376f]">
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
        className="actividades-fontanero-historial__back !hidden"
      >
        Volver al menú de actividades
      </Link>
    </section>
  )
}

export default ActividadesFontaneroHistorialPage
