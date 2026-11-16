import { IconArrowLeft, IconRefresh } from '@tabler/icons-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import {
  AdminShell,
  Alert,
  Button,
  Card,
  PageHeader,
} from '../../../shared/ui'
import { useAuth } from '../../auth/components/AuthContext'
import {
  esNoAutenticado,
  getHttpStatus,
} from '../../recursos-humanos/colaboradorForm'
import { formatearFechaPermiso } from '../../recursos-humanos/permisoForm'
import {
  estadoSolicitudAusenciaClassName,
  estadoSolicitudAusenciaLabel,
  tipoSolicitudAusenciaLabel,
} from '../solicitudAusenciaLabels'
import {
  abrirEvidenciaSolicitudAusencia,
  getMiSolicitudAusencia,
} from '../solicitudesAusenciaApi'
import { FONTANERO_MIS_SOLICITUDES_PATH } from '../solicitudesAusenciaPaths'
import type { SolicitudAusenciaFontanero } from '../types'

type Carga = {
  clave: string
  solicitud: SolicitudAusenciaFontanero | null
  error: string | null
  notFound: boolean
}

function Dato({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1 rounded-[10px] border border-sigasj-border bg-sigasj-surface-soft/50 px-4 py-3">
      <dt className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted">
        {label}
      </dt>
      <dd className="m-0 text-base font-semibold text-sigasj-ink">{children}</dd>
    </div>
  )
}

/**
 * PBI 6.5.6 — Detalle propio (solo lectura). Consulta siempre al Backend.
 */
export default function MiSolicitudAusenciaDetallePage() {
  const { id } = useParams()
  const solicitudId = Number(id)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [recarga, setRecarga] = useState(0)
  const [carga, setCarga] = useState<Carga>({
    clave: '',
    solicitud: null,
    error: null,
    notFound: false,
  })
  const idValido = Number.isInteger(solicitudId) && solicitudId > 0
  const clave = `${solicitudId}:${recarga}`
  const cargando = idValido && carga.clave !== clave

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  useEffect(() => {
    if (!idValido) return undefined
    const controller = new AbortController()
    getMiSolicitudAusencia(solicitudId, controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return
        setCarga({
          clave,
          solicitud: respuesta,
          error: null,
          notFound: false,
        })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (esNoAutenticado(err)) {
          salirPorSesion()
          return
        }
        const status = getHttpStatus(err)
        if (status === 403) {
          navigate(UNAUTHORIZED_ROUTE_PATH, { replace: true })
          return
        }
        setCarga({
          clave,
          solicitud: null,
          notFound: status === 404,
          error:
            status === 404
              ? 'No se encontró la solicitud.'
              : 'No fue posible cargar la solicitud. Intente nuevamente.',
        })
      })
    return () => controller.abort()
  }, [clave, idValido, solicitudId, salirPorSesion, navigate])

  const solicitud = carga.solicitud

  return (
    <AdminShell
      className="mx-auto max-w-3xl gap-5 sm:gap-6"
      aria-labelledby="mi-solicitud-ausencia-detalle-title"
    >
      <PageHeader
        id="mi-solicitud-ausencia-detalle-title"
        eyebrow={
          solicitud
            ? `Solicitud de ${tipoSolicitudAusenciaLabel(solicitud.tipo).toLowerCase()}`
            : 'Mis solicitudes'
        }
        title={
          solicitud ? (
            <span className="inline-flex flex-wrap items-center gap-3">
              {tipoSolicitudAusenciaLabel(solicitud.tipo)}
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${estadoSolicitudAusenciaClassName(solicitud.estado)}`}
              >
                {estadoSolicitudAusenciaLabel(solicitud.estado)}
              </span>
            </span>
          ) : (
            'Detalle de solicitud'
          )
        }
        description={
          solicitud
            ? `Registrada el ${formatearFechaPermiso(solicitud.createdAt.slice(0, 10))}`
            : 'Consulta el estado y los datos de su trámite.'
        }
        actions={
          <Button
            to={FONTANERO_MIS_SOLICITUDES_PATH}
            variant="secondary"
            size="sm"
            leftIcon={<IconArrowLeft size={16} aria-hidden="true" />}
          >
            Mis solicitudes
          </Button>
        }
      />

      {!idValido ? (
        <Alert tone="warning">No se encontró la solicitud.</Alert>
      ) : cargando ? (
        <Card padded role="status">
          Cargando solicitud…
        </Card>
      ) : carga.error || !solicitud ? (
        <Alert tone="danger">
          <div className="grid gap-3">
            <p className="m-0 font-semibold">
              {carga.error ?? 'No se encontró la solicitud.'}
            </p>
            {!carga.notFound ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="justify-self-start"
                leftIcon={<IconRefresh size={16} aria-hidden="true" />}
                onClick={() => setRecarga((n) => n + 1)}
              >
                Reintentar
              </Button>
            ) : null}
          </div>
        </Alert>
      ) : (
        <>
          {solicitud.estado === 'PENDIENTE' ? (
            <Alert tone="warning">
              Su solicitud está pendiente de revisión.
            </Alert>
          ) : null}
          {solicitud.estado === 'APROBADA' ? (
            <Alert tone="success">
              Su solicitud fue aprobada por la Administración.
            </Alert>
          ) : null}
          {solicitud.estado === 'RECHAZADA' ? (
            <Alert tone="danger">Su solicitud fue rechazada.</Alert>
          ) : null}

          <Card as="article" padded className="grid gap-5">
            <dl className="m-0 grid gap-3 sm:grid-cols-2">
              <Dato label="Periodo">
                {formatearFechaPermiso(solicitud.fechaInicio)} —{' '}
                {formatearFechaPermiso(solicitud.fechaFin)}
              </Dato>
              <Dato label="Fecha de solicitud">
                {formatearFechaPermiso(solicitud.createdAt.slice(0, 10))}
              </Dato>
              <Dato label="Motivo">{solicitud.motivo?.trim() || 'Sin motivo'}</Dato>
              <Dato label="Correo para aviso">
                {solicitud.correoNotificacion?.trim() || 'Sin correo indicado'}
              </Dato>
              {solicitud.observaciones?.trim() ? (
                <Dato label="Observaciones">{solicitud.observaciones}</Dato>
              ) : null}
              {solicitud.reviewedAt ? (
                <Dato label="Fecha de revisión">
                  {formatearFechaPermiso(String(solicitud.reviewedAt).slice(0, 10))}
                </Dato>
              ) : null}
              {solicitud.estado === 'RECHAZADA' && solicitud.motivoRechazo?.trim() ? (
                <Dato label="Motivo del rechazo">{solicitud.motivoRechazo}</Dato>
              ) : null}
              {solicitud.tipo === 'VACACIONES' && solicitud.resumenVacaciones ? (
                <div className="grid min-w-0 gap-1 rounded-[10px] border border-sigasj-border bg-sigasj-surface-soft/50 px-4 py-3 sm:col-span-2">
                  <dt className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted">
                    Días de vacaciones (sin feriados)
                  </dt>
                  <dd className="m-0 text-base font-semibold text-sigasj-ink">
                    Calendario: {solicitud.resumenVacaciones.diasCalendario} · Feriados:{' '}
                    {solicitud.resumenVacaciones.feriados.length} · A descontar:{' '}
                    {solicitud.resumenVacaciones.diasNetos}
                  </dd>
                  {solicitud.resumenVacaciones.feriados.length > 0 ? (
                    <ul className="m-0 mt-2 list-disc space-y-1 pl-5 text-sm font-medium text-sigasj-muted">
                      {solicitud.resumenVacaciones.feriados.map((f) => (
                        <li key={f.fecha}>
                          {formatearFechaPermiso(f.fecha)} — {f.nombre}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </dl>

            <section className="grid gap-2 border-t border-sigasj-border pt-5">
              <h2 className="m-0 text-sm font-extrabold uppercase tracking-wider text-sigasj-muted">
                Evidencia
              </h2>
              {solicitud.documentos?.length ? (
                <ul className="m-0 grid list-none gap-2 p-0">
                  {solicitud.documentos.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-sigasj-border bg-sigasj-surface-soft/50 px-4 py-3"
                    >
                      <span className="font-semibold text-sigasj-ink">
                        {doc.nombreOriginal}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          void abrirEvidenciaSolicitudAusencia(
                            doc.rutaReferenciaArchivo,
                            'fontanero',
                          )
                        }
                      >
                        Ver documento
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="m-0 text-sm font-semibold text-sigasj-muted">
                  Sin evidencia adjunta.
                </p>
              )}
            </section>
          </Card>
        </>
      )}
    </AdminShell>
  )
}