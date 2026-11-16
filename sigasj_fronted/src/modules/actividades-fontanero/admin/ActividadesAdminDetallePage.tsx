import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  IconArrowLeft,
  IconCircleCheck,
  IconMessageExclamation,
} from '@tabler/icons-react'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import { clearAccessToken } from '../../auth/utils/authStorage'
import ActivityFeedback from '../components/ActivityFeedback'
import DetalleActividad from '../components/DetalleActividad'
import {
  getActividadAdminDetalle,
  revisarActividadAdmin,
  solicitarCorreccionAdmin,
} from '../services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { interpretActividadApiError } from '../utils/interpretActividadApiError'
import { mergeActividadFontanero } from '../utils/normalizeActividadFontanero'
import { ACTIVIDADES_ADMIN_PATHS } from './actividadesAdminPaths'

const ActividadesAdminDetallePage = () => {
  const { actividadId } = useParams<{ actividadId: string }>()
  const navigate = useNavigate()
  const parsedId = Number(actividadId)
  const idValido = Number.isInteger(parsedId) && parsedId > 0

  const [actividad, setActividad] = useState<ActividadFontaneroRegistrada | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unauthorized, setUnauthorized] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmReview, setConfirmReview] = useState(false)
  const [confirmCorrection, setConfirmCorrection] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [requestingCorrection, setRequestingCorrection] = useState(false)
  const [correctionNote, setCorrectionNote] = useState('')
  const [correctionError, setCorrectionError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const busy = reviewing || requestingCorrection

  useEffect(() => {
    if (!idValido) {
      setLoading(false)
      setError(ACTIVITY_FEEDBACK_MESSAGES.notFound)
      setActividad(null)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    void getActividadAdminDetalle(parsedId)
      .then((detalle) => {
        if (!active) return
        setActividad(detalle)
      })
      .catch((caught) => {
        if (!active) return
        const interpreted = interpretActividadApiError(caught, {
          notFoundMessage: ACTIVITY_FEEDBACK_MESSAGES.notFound,
        })
        if (interpreted.kind === 'unauthorized') {
          clearAccessToken()
          setUnauthorized(true)
        } else if (interpreted.kind === 'forbidden') {
          setForbidden(true)
        } else {
          setError(interpreted.message)
          setActividad(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [idValido, parsedId, reloadKey])

  if (unauthorized) return <Navigate to={LOGIN_ROUTE_PATH} replace />
  if (forbidden) return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />

  const canReview =
    !loading &&
    !error &&
    actividad != null &&
    actividad.estadoRevision !== 'REVISADA' &&
    actividad.estado !== 'REVISADA'

  const canRequestCorrection =
    !loading &&
    !error &&
    actividad != null &&
    actividad.estado !== 'REQUIERE_CORRECCION' &&
    actividad.estado !== 'REVISADA'

  const markReviewed = async () => {
    if (!actividad || !canReview || busy) return
    setReviewing(true)
    setConfirmReview(false)
    setError(null)
    try {
      const updated = await revisarActividadAdmin(actividad.id)
      setActividad((current) => mergeActividadFontanero(current, updated))
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
    if (!actividad || busy) return
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
      const updated = await solicitarCorreccionAdmin(actividad.id, observacion)
      setActividad((current) => mergeActividadFontanero(current, updated))
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

  return (
    <main className="gallery-admin admin-content-modern actividades-admin-revision min-w-0">
      <div className="gallery-admin__shell sigasj-stack">
        <header className="gallery-admin__header gallery-admin__header--editor actividades-admin-detalle__topbar">
          <div className="gallery-admin__header-copy min-w-0">
            <div>
              <p className="gallery-admin__eyebrow">Revisión de actividades</p>
              <h1>Detalle de actividad</h1>
            </div>
          </div>
          <div className="gallery-admin__header-actions">
            <Link
              to={ACTIVIDADES_ADMIN_PATHS.revision}
              className="gallery-admin__button gallery-admin__back-btn inline-flex min-h-11 items-center gap-2 rounded-2xl"
            >
              <IconArrowLeft size={18} aria-hidden="true" />
              Volver a la búsqueda
            </Link>
          </div>
        </header>

        {notice ? (
          <ActivityFeedback
            variant="success"
            message={notice}
            dismissible
            onDismiss={() => setNotice(null)}
            testId="admin-revision-exito"
          />
        ) : null}

        {error && !loading ? (
          <ActivityFeedback
            variant="error"
            message={error}
            action={
              idValido ? (
                <button
                  className="activity-feedback__retry"
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                >
                  Reintentar
                </button>
              ) : (
                <button
                  className="activity-feedback__retry"
                  type="button"
                  onClick={() => navigate(ACTIVIDADES_ADMIN_PATHS.revision)}
                >
                  Volver a la búsqueda
                </button>
              )
            }
          />
        ) : null}

        <section
          className="actividades-admin-detalle"
          aria-label="Apartado de detalle de la actividad"
        >
          <DetalleActividad
            actividad={actividad}
            loading={loading}
            error={error && !actividad ? error : null}
            showFontanero
            variant="page"
            actions={
              actividad && !loading ? (
                <div className="actividades-admin-revision__detail-actions actividades-admin-revision__detail-actions--panel">
                  <div className="actividades-admin-revision__panel-head">
                    <h3>Revisión administrativa</h3>
                    <p>
                      Confirme la actividad o solicite una corrección al fontanero.
                    </p>
                  </div>

                  {!canReview ? (
                    <ActivityFeedback
                      variant="info"
                      message="Esta actividad ya fue revisada; no es necesario procesarla nuevamente."
                      className="actividades-admin-revision__already-reviewed"
                    />
                  ) : null}

                  <div className="actividades-admin-revision__panel-grid">
                    <div className="actividades-admin-revision__panel-card actividades-admin-revision__panel-card--approve">
                      <div className="actividades-admin-revision__panel-card-head">
                        <span
                          className="actividades-admin-revision__panel-icon"
                          aria-hidden="true"
                        >
                          <IconCircleCheck size={20} stroke={2} />
                        </span>
                        <div>
                          <p className="actividades-admin-revision__panel-label">
                            Aprobar registro
                          </p>
                          <p className="actividades-admin-revision__panel-hint">
                            Confirme si la información reportada es correcta.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="gallery-admin__button gallery-admin__button--primary actividades-admin-revision__panel-cta"
                        disabled={busy || !canReview}
                        onClick={() => {
                          if (canReview) setConfirmReview(true)
                        }}
                      >
                        <IconCircleCheck size={18} aria-hidden="true" />
                        {!canReview
                          ? 'Actividad revisada'
                          : reviewing
                            ? 'Marcando…'
                            : 'Marcar como revisada'}
                      </button>
                    </div>

                    {canRequestCorrection ? (
                      <div className="actividades-admin-revision__panel-card actividades-admin-revision__panel-card--correct">
                        <div className="actividades-admin-revision__panel-card-head">
                          <span
                            className="actividades-admin-revision__panel-icon"
                            aria-hidden="true"
                          >
                            <IconMessageExclamation size={20} stroke={2} />
                          </span>
                          <div>
                            <p className="actividades-admin-revision__panel-label">
                              Solicitar corrección
                            </p>
                            <p className="actividades-admin-revision__panel-hint">
                              Indique al fontanero qué debe corregir.
                            </p>
                          </div>
                        </div>
                        <label
                          className="gallery-admin__field"
                          htmlFor="admin-correction-note"
                        >
                          <span className="sr-only">Observación para corrección</span>
                          <textarea
                            id="admin-correction-note"
                            rows={3}
                            maxLength={2000}
                            value={correctionNote}
                            disabled={busy}
                            placeholder="Ej.: completar hora de finalización y adjuntar foto del caudal"
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
                          className="gallery-admin__button actividades-admin-revision__correction-button actividades-admin-revision__panel-cta"
                          disabled={busy || !correctionNote.trim()}
                          onClick={() => setConfirmCorrection(true)}
                        >
                          <IconMessageExclamation size={18} aria-hidden="true" />
                          {requestingCorrection
                            ? 'Solicitando…'
                            : 'Solicitar corrección'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null
            }
          />
        </section>
      </div>

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

export default ActividadesAdminDetallePage
