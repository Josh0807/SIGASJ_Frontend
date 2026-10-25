import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconArrowLeft } from '@tabler/icons-react'
import { useAuth } from '../../auth/components/AuthContext'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import ActividadDetalleOverlay from '../components/ActividadDetalleOverlay'
import ActivityFeedback from '../components/ActivityFeedback'
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
    <section
      className="actividades-fontanero-historial !mx-0 !max-w-none !gap-7"
      aria-labelledby="mis-actividades-title"
    >
      <header className="actividades-fontanero-historial__header !rounded-[28px] !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/70 !px-8 !py-8 !shadow-[0_14px_38px_rgba(30,90,156,0.10)] md:!px-10">
        <div className="min-w-0 space-y-3">
          <p className="!m-0 !text-sm !font-black !uppercase !tracking-[0.12em] !text-blue-600">
            Registro de Actividades
          </p>
          <h1
            id="mis-actividades-title"
            className="!m-0 !text-3xl !font-black !tracking-tight !text-[#07376f] md:!text-4xl"
          >
            Mis actividades
          </h1>
          <p className="!m-0 !text-lg !leading-relaxed !text-slate-500">
            Consulte todas las actividades que ha registrado y su estado de revisión.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-3 lg:items-end">
          <Link
            to={ACTIVIDADES_FONTANERO_PATHS.home}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 font-bold !no-underline text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:bg-blue-50 hover:!no-underline"
          >
            <IconArrowLeft size={20} aria-hidden="true" />
            Volver al menú de actividades
          </Link>
          {!isLoading && !error ? (
            <p role="status" data-testid="mis-actividades-total">
              {filtradas.length} {filtradas.length === 1 ? 'actividad' : 'actividades'}
            </p>
          ) : null}
        </div>
      </header>

      <div className="actividades-fontanero-historial__filters !rounded-[28px] !border-blue-100 !bg-white/90 !p-6 md:!p-8">
        <label className="actividades-fontanero-historial__field">
          <span className="text-sm font-black uppercase tracking-[0.08em] text-blue-700">Estado</span>
          <select
            value={estado}
            onChange={(event) => {
              setEstado(event.target.value)
              setPage(1)
            }}
            data-testid="mis-actividades-estado"
            className="!min-h-14 !rounded-2xl !border-blue-200 !bg-white !px-4"
          >
            <option value="">Todos</option>
            {ESTADOS_FILTRO.map((value) => (
              <option key={value} value={value}>
                {formatActividadEstado(value)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <ActivityFeedback variant="info" message="Consultando sus actividades…" />
      ) : null}

      {error ? (
        <ActivityFeedback
          variant="error"
          message={error}
          action={
            <button
              type="button"
              onClick={() => {
                setIsLoading(true)
                setError(null)
                setReloadKey((key) => key + 1)
              }}
            >
              Reintentar
            </button>
          }
        />
      ) : null}

      {!isLoading && !error && filtradas.length === 0 ? (
        <ActivityFeedback
          variant="info"
          message={
            actividades.length === 0
              ? 'Todavía no ha registrado actividades.'
              : 'No hay actividades con el estado seleccionado.'
          }
        />
      ) : null}

      {!isLoading && !error && visibles.length > 0 ? (
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
      ) : null}

      {!isLoading && !error && totalPages > 1 ? (
        <nav
          aria-label="Paginación de mis actividades"
          className="actividades-fontanero-historial__pagination"
        >
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Anterior
          </button>
          <p>
            Página {currentPage} de {totalPages}
          </p>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Siguiente
          </button>
        </nav>
      ) : null}

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
    </section>
  )
}

export default MisActividadesPage
