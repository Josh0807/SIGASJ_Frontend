import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import ActividadDetalleOverlay from '../components/ActividadDetalleOverlay'
import HistorialActividadCard from '../components/HistorialActividadCard'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { getActividadDetalle } from '../services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { getHttpErrorStatus } from '../utils/httpErrorStatus'
import { useHistorialActividades } from '../hooks/useHistorialActividades'
import {
  HISTORIAL_PAGE_SIZE,
  hasHistorialPeriodFilter,
  type HistorialActividadesFilters,
} from '../types/actividadHistorial'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import {
  IconArrowLeft,
  IconCalendarSearch,
  IconChevronLeft,
  IconChevronRight,
  IconEraser,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react'
import {
  AdminFilterAction,
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
  const [selected, setSelected] = useState<ActividadFontaneroRegistrada | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

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

  const openDetail = async (actividad: ActividadFontaneroRegistrada) => {
    setSelected(actividad)
    setDetailLoading(true)
    setDetailError(null)
    try {
      const detalle = await getActividadDetalle(actividad.id)
      setSelected(detalle)
    } catch (error) {
      const status = getHttpErrorStatus(error)
      if (status === 401) {
        logout()
        navigate('/login', { replace: true })
        return
      }
      setDetailError(
        status === 403
          ? ACTIVITY_FEEDBACK_MESSAGES.forbidden
          : status === 404
            ? ACTIVITY_FEEDBACK_MESSAGES.notFound
            : ACTIVITY_FEEDBACK_MESSAGES.loadGeneric,
      )
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <AdminShell
      className="actividades-fontanero-historial gap-5 sm:gap-6"
      aria-labelledby="historial-actividades-title"
    >
      <PageHeader
        id="historial-actividades-title"
        eyebrow="Registro de actividades"
        title="Historial de actividades"
        description="Consulte las actividades finalizadas o revisadas durante la jornada o en un periodo específico."
        actions={
          <Button
            to={ACTIVIDADES_FONTANERO_PATHS.home}
            variant="secondary"
            leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
          >
            Menú de actividades
          </Button>
        }
      />

      <form onSubmit={handleConsultar}>
        <AdminFilters
          aria-label="Filtros del historial"
          summary={
            !isLoading && !isError ? (
              <>
                <strong className="text-sigasj-ink" data-testid="historial-total">
                  {total}
                </strong>
                <span>{total === 1 ? 'actividad' : 'actividades'}</span>
              </>
            ) : null
          }
        >
          <AdminFilterField label="Desde">
            <input
              type="date"
              className={adminFilterControlClassName}
              value={draft.fechaInicio}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fechaInicio: event.target.value,
                }))
              }
              data-testid="historial-fecha-inicio"
            />
          </AdminFilterField>
          <AdminFilterField label="Hasta">
            <input
              type="date"
              className={adminFilterControlClassName}
              value={draft.fechaFin}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fechaFin: event.target.value,
                }))
              }
              data-testid="historial-fecha-fin"
            />
          </AdminFilterField>
          <AdminFilterAction className="col-span-full min-[761px]:col-auto">
            <div className="flex flex-wrap gap-2 max-[760px]:flex-col max-[760px]:[&>*]:w-full">
              <Button
                type="submit"
                variant="primary"
                data-testid="historial-consultar"
                leftIcon={<IconSearch size={17} aria-hidden="true" />}
              >
                Consultar
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleLimpiar}
                leftIcon={<IconEraser size={17} aria-hidden="true" />}
              >
                Limpiar
              </Button>
            </div>
          </AdminFilterAction>
        </AdminFilters>
      </form>

      {clientError ? (
        <Alert tone="warning">{clientError}</Alert>
      ) : null}

      {isForbidden ? (
        <Alert tone="danger">{ACTIVITY_FEEDBACK_MESSAGES.forbidden}</Alert>
      ) : null}

      {isError && !isForbidden ? (
        <Alert tone="danger">
          <div className="grid gap-3">
            <p className="m-0 font-semibold">
              {errorMessage ?? ACTIVITY_FEEDBACK_MESSAGES.loadGeneric}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="justify-self-start"
              leftIcon={<IconRefresh size={16} aria-hidden="true" />}
              onClick={refetch}
            >
              Reintentar
            </Button>
          </div>
        </Alert>
      ) : null}

      <Card
        as="section"
        padded
        className="actividades-fontanero-historial__list !gap-4"
        aria-label="Historial de actividades"
      >
        {isLoading ? (
          <Alert tone="info" data-testid="historial-cargando">
            Cargando historial de actividades…
          </Alert>
        ) : isEmpty ? (
          <EmptyState
            icon={<IconCalendarSearch size={28} aria-hidden="true" />}
            title={
              hasPeriodFilter
                ? 'No hay actividades en el periodo seleccionado'
                : 'Sin actividades en el historial'
            }
            description={
              hasPeriodFilter
                ? 'Pruebe ampliar el rango de fechas o limpiar los filtros.'
                : 'Cuando sus actividades sean aprobadas, rechazadas o corregidas, aparecerán aquí para consulta.'
            }
            data-testid="historial-lista-vacia"
          />
        ) : !isError && actividades.length > 0 ? (
          <>
            <ul className="actividades-fontanero-historial__list m-0 grid list-none gap-3 p-0">
              {actividades.map((actividad) => (
                <li key={actividad.id}>
                  <HistorialActividadCard
                    actividad={actividad}
                    onVerDetalle={() => {
                      void openDetail(actividad)
                    }}
                  />
                </li>
              ))}
            </ul>

            {totalPages > 1 ? (
              <nav
                className="flex flex-col items-center justify-between gap-3 border-t border-sigasj-border pt-4 text-sm text-sigasj-muted sm:flex-row"
                aria-label="Paginación del historial"
              >
                <p className="m-0 font-semibold" aria-current="page">
                  Página {page} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<IconChevronLeft size={16} aria-hidden="true" />}
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    rightIcon={<IconChevronRight size={16} aria-hidden="true" />}
                    disabled={page >= totalPages}
                    onClick={() => goToPage(page + 1)}
                    data-testid="historial-pagina-siguiente"
                  >
                    Siguiente
                  </Button>
                </div>
              </nav>
            ) : null}
          </>
        ) : null}
      </Card>

      {selected || detailLoading || detailError ? (
        <ActividadDetalleOverlay
          actividad={selected}
          loading={detailLoading}
          error={detailError}
          onClose={() => {
            setSelected(null)
            setDetailError(null)
          }}
        />
      ) : null}
    </AdminShell>
  )
}

export default ActividadesFontaneroHistorialPage
