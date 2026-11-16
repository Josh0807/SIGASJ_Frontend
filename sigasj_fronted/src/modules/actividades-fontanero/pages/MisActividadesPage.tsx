import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
  IconClipboardList,
  IconRefresh,
} from '@tabler/icons-react'
import {
  AdminFilterField,
  AdminFilters,
  AdminShell,
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
  adminFilterSelectClassName,
} from '../../../shared/ui'
import { useAuth } from '../../auth/components/AuthContext'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import ActividadDetalleOverlay from '../components/ActividadDetalleOverlay'
import HistorialActividadCard from '../components/HistorialActividadCard'
import { getActividadDetalle, getMisActividades } from '../services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { formatActividadEstado } from '../utils/formatActividadEstado'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { getHttpErrorStatus } from '../utils/httpErrorStatus'

export const MIS_ACTIVIDADES_PAGE_SIZE = 10

const ESTADOS_FILTRO = [
  'BORRADOR',
  'REPORTADA',
  'REQUIERE_CORRECCION',
  'CORREGIDA',
  'REVISADA',
  'APROBADA',
  'RECHAZADA',
] as const

const MisActividadesPage = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [actividades, setActividades] = useState<ActividadFontaneroRegistrada[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estado, setEstado] = useState('')
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [selected, setSelected] = useState<ActividadFontaneroRegistrada | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getMisActividades()
      .then((result) => {
        if (active) {
          setActividades(result.data)
        }
      })
      .catch((err: unknown) => {
        if (!active) {
          return
        }
        const status = getHttpErrorStatus(err)
        if (status === 401) {
          logout()
          navigate('/login', { replace: true })
          return
        }
        setError(
          status === 403
            ? 'No tiene permisos para consultar estas actividades.'
            : 'No se pudieron consultar sus actividades. Intente nuevamente.',
        )
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [logout, navigate, reloadKey])

  const filtradas = useMemo(
    () => (estado ? actividades.filter((item) => item.estado === estado) : actividades),
    [actividades, estado],
  )
  const totalPages = Math.max(1, Math.ceil(filtradas.length / MIS_ACTIVIDADES_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visibles = filtradas.slice(
    (currentPage - 1) * MIS_ACTIVIDADES_PAGE_SIZE,
    currentPage * MIS_ACTIVIDADES_PAGE_SIZE,
  )

  const openDetail = async (actividad: ActividadFontaneroRegistrada) => {
    setSelected(actividad)
    setDetailLoading(true)
    setDetailError(null)
    try {
      const detalle = await getActividadDetalle(actividad.id)
      setSelected(detalle)
    } catch (err: unknown) {
      const status = getHttpErrorStatus(err)
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
      className="gap-5 sm:gap-6"
      aria-labelledby="mis-actividades-title"
    >
      <PageHeader
        id="mis-actividades-title"
        eyebrow="Registro de actividades"
        title="Mis actividades"
        description="Consulte todas las actividades que ha registrado y su estado de revisión."
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

      <AdminFilters
        aria-label="Filtro por estado"
        summary={
          !isLoading && !error ? (
            <>
              <strong className="text-sigasj-ink" data-testid="mis-actividades-total">
                {filtradas.length}
              </strong>
              <span>{filtradas.length === 1 ? 'actividad' : 'actividades'}</span>
            </>
          ) : null
        }
      >
        <AdminFilterField label="Estado">
          <select
            className={adminFilterSelectClassName}
            value={estado}
            onChange={(event) => {
              setEstado(event.target.value)
              setPage(1)
            }}
            data-testid="mis-actividades-estado"
          >
            <option value="">Todos</option>
            {ESTADOS_FILTRO.map((value) => (
              <option key={value} value={value}>
                {formatActividadEstado(value)}
              </option>
            ))}
          </select>
        </AdminFilterField>
      </AdminFilters>

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
                setIsLoading(true)
                setError(null)
                setReloadKey((key) => key + 1)
              }}
            >
              Reintentar
            </Button>
          </div>
        </Alert>
      ) : null}

      <Card as="section" padded className="!gap-4">
        {isLoading ? (
          <Alert tone="info">Consultando sus actividades…</Alert>
        ) : !error && filtradas.length === 0 ? (
          <EmptyState
            icon={<IconClipboardList size={28} aria-hidden="true" />}
            title={
              actividades.length === 0
                ? 'Todavía no ha registrado actividades'
                : 'Sin resultados para este estado'
            }
            description={
              actividades.length === 0
                ? 'Cuando registre actividades, aparecerán aquí con su estado de revisión.'
                : 'Pruebe otro estado o limpie el filtro.'
            }
          />
        ) : !error && visibles.length > 0 ? (
          <>
            <ul
              className="actividades-fontanero-historial__list m-0 grid list-none gap-4 p-0"
              data-testid="mis-actividades-lista"
            >
              {visibles.map((actividad) => (
                <li key={actividad.id}>
                  <HistorialActividadCard
                    actividad={actividad}
                    onVerDetalle={() => {
                      void openDetail(actividad)
                    }}
                    extraFooter={
                      actividad.estado === 'BORRADOR' ? (
                        <Link
                          to={ACTIVIDADES_FONTANERO_PATHS.editarBorrador(actividad.id)}
                          className="actividad-historial-card__action"
                        >
                          Editar borrador
                        </Link>
                      ) : actividad.estado === 'REQUIERE_CORRECCION' ? (
                        <Link
                          to={ACTIVIDADES_FONTANERO_PATHS.corregirActividad(actividad.id)}
                          className="actividad-historial-card__action"
                        >
                          Corregir actividad
                        </Link>
                      ) : null
                    }
                  />
                </li>
              ))}
            </ul>

            {totalPages > 1 ? (
              <nav
                aria-label="Paginación de mis actividades"
                className="flex flex-col items-center justify-between gap-3 border-t border-sigasj-border pt-4 text-sm text-sigasj-muted sm:flex-row"
              >
                <p className="m-0 font-semibold">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<IconChevronLeft size={16} aria-hidden="true" />}
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    rightIcon={<IconChevronRight size={16} aria-hidden="true" />}
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
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

export default MisActividadesPage
