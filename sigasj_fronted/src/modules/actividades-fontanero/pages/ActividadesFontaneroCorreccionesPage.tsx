import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import ActivityFeedback from '../components/ActivityFeedback'
import CorreccionPendienteCard from '../components/CorreccionPendienteCard'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { useCorreccionesPendientes } from '../hooks/useCorreccionesPendientes'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { IconArrowLeft, IconChecks } from '@tabler/icons-react'

const ActividadesFontaneroCorreccionesPage = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const {
    actividades,
    total,
    isLoading,
    isError,
    isEmpty,
    isUnauthorized,
    isForbidden,
    refetch,
  } = useCorreccionesPendientes()

  useEffect(() => {
    if (isUnauthorized) {
      logout()
      navigate('/login', { replace: true })
    }
  }, [isUnauthorized, logout, navigate])

  return (
    <section
      className="actividades-fontanero-correcciones !mx-0 !max-w-none !gap-7"
      aria-labelledby="correcciones-pendientes-title"
    >
      <header className="actividades-fontanero-correcciones__header !rounded-[28px] !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/70 !px-8 !py-8 !shadow-[0_14px_38px_rgba(30,90,156,0.10)] md:!px-10">
        <div className="min-w-0 space-y-3">
          <p className="actividades-fontanero-correcciones__eyebrow !m-0 !text-sm !font-black !tracking-[0.12em] !text-blue-600">
            Registro de Actividades
          </p>
          <h1 id="correcciones-pendientes-title" className="!m-0 !text-3xl !font-black !tracking-tight !text-[#07376f] md:!text-4xl">Correcciones pendientes</h1>
          <p className="actividades-fontanero-correcciones__intro !m-0 !text-lg !leading-relaxed !text-slate-500">
            Revise las actividades que requieren ajuste, lea el motivo indicado y
            reenvíe la información corregida.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-3 lg:items-end">
          <Link to={ACTIVIDADES_FONTANERO_PATHS.home} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 font-bold !no-underline text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:bg-blue-50 hover:!no-underline">
            <IconArrowLeft size={20} aria-hidden="true" />
            Volver al menú de actividades
          </Link>
        {!isLoading && !isError && total > 0 ? (
          <p
            className="actividades-fontanero-correcciones__count"
            role="status"
            data-testid="correcciones-total"
          >
            {total} {total === 1 ? 'actividad pendiente' : 'actividades pendientes'}
          </p>
        ) : null}
        </div>
      </header>

      {isLoading ? (
        <div
          className="actividades-fontanero-correcciones__state"
          role="status"
          data-testid="correcciones-cargando"
        >
          <span className="actividades-fontanero-correcciones__spinner" aria-hidden="true" />
          Cargando correcciones pendientes…
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
          message={ACTIVITY_FEEDBACK_MESSAGES.loadGeneric}
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
          className="actividades-fontanero-correcciones__empty !rounded-[28px] !border !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/60 !p-8 !shadow-[0_12px_32px_rgba(30,90,156,0.08)]"
          role="status"
          data-testid="correcciones-lista-vacia"
        >
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><IconChecks size={28} aria-hidden="true" /></span>
          <p className="actividades-fontanero-correcciones__empty-title !text-xl !font-black !text-[#07376f]">
            Sin correcciones pendientes
          </p>
          <p className="actividades-fontanero-correcciones__empty-text">
            Cuando una actividad requiera ajustes, aparecerá aquí con el motivo y la
            opción para corregirla.
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && actividades.length > 0 ? (
        <div
          className="actividades-fontanero-correcciones__list"
          role="list"
          aria-label="Actividades pendientes de corrección"
        >
          {actividades.map((actividad) => (
            <div key={actividad.id} role="listitem">
              <CorreccionPendienteCard actividad={actividad} />
            </div>
          ))}
        </div>
      ) : null}

      <Link
        to={ACTIVIDADES_FONTANERO_PATHS.home}
        className="actividades-fontanero-correcciones__back !hidden"
      >
        Volver al menú de actividades
      </Link>
    </section>
  )
}

export default ActividadesFontaneroCorreccionesPage
