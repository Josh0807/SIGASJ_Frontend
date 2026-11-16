import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  IconArrowLeft,
  IconCircleCheck,
  IconMessageExclamation,
} from '@tabler/icons-react'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import {
  AdminFilterField,
  AdminShell,
  Alert,
  Button,
  PageHeader,
  adminFilterControlClassName,
} from '../../../shared/ui'
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
    <AdminShell
      className="actividades-admin-revision min-w-0 gap-5 sm:gap-6"
      aria-labelledby="actividades-admin-detalle-title"
    >
      <PageHeader
        id="actividades-admin-detalle-title"
        eyebrow="Revisión de actividades"
        title="Detalle de actividad"
        actions={
          <Button
            to={ACTIVIDADES_ADMIN_PATHS.revision}
            variant="secondary"
            leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
          >
            {ADMIN_COPY.backToList}
          </Button>
        }
      />

      {notice ? (
        <Alert tone="success" role="status">
          {notice}
        </Alert>
      ) : null}

      {error && !loading ? (
        <Alert tone="danger">
          <div className="grid gap-3">
            <p className="m-0 font-semibold">{error}</p>
            {idValido ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="justify-self-start"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                {ADMIN_COPY.retry}
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="justify-self-start"
                onClick={() => navigate(ACTIVIDADES_ADMIN_PATHS.revision)}
              >
                Volver a la búsqueda
              </Button>
            )}
          </div>
        </Alert>
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
                      <Button
                        type="button"
                        variant="primary"
                        className="actividades-admin-revision__panel-cta w-full"
                        disabled={busy || !canReview}
                        loading={reviewing}
                        leftIcon={<IconCircleCheck size={18} aria-hidden="true" />}
                        onClick={() => {
                          if (canReview) setConfirmReview(true)
                        }}
                      >
                        {!canReview
                          ? 'Actividad revisada'
                          : reviewing
                            ? 'Marcando…'
                            : 'Marcar como revisada'}
                      </Button>
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
                        <AdminFilterField label="Observación para corrección">
                          <textarea
                            id="admin-correction-note"
                            rows={3}
                            maxLength={2000}
                            className={`${adminFilterControlClassName} min-h-[5.5rem] resize-y py-2`}
                            value={correctionNote}
                            disabled={busy}
                            placeholder="Ej.: completar hora de finalización y adjuntar foto del caudal"
                            onChange={(event) => {
                              setCorrectionNote(event.target.value)
                              setCorrectionError(null)
                            }}
                          />
                        </AdminFilterField>
                        {correctionError ? (
                          <Alert tone="danger">{correctionError}</Alert>
                        ) : null}
                        <Button
                          type="button"
                          variant="secondary"
                          className="actividades-admin-revision__panel-cta w-full"
                          disabled={busy || !correctionNote.trim()}
                          loading={requestingCorrection}
                          leftIcon={
                            <IconMessageExclamation size={18} aria-hidden="true" />
                          }
                          onClick={() => setConfirmCorrection(true)}
                        >
                          {requestingCorrection
                            ? 'Solicitando…'
                            : 'Solicitar corrección'}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null
            }
          />
        </section>

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
    </AdminShell>
  )
}

export default ActividadesAdminDetallePage
