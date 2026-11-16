import {
  IconArrowLeft,
  IconCalendar,
  IconEdit,
  IconId,
  IconMail,
  IconRefresh,
  IconUser,
  IconUserOff,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { useAuth } from '../auth/components/AuthContext'
import {
  asociadoConsultaError,
  esNoAutenticado,
  esReintentable,
  formatearFecha,
  nombreCompleto,
} from './asociadoForm'
import { getAsociado } from './asociadosApi'
import { ASOCIADOS_PATH, ASOCIADOS_TITLE, asociadoEditPath } from './asociadosPaths'
import EstadoAsociadoBadge from './EstadoAsociadoBadge'
import type { Asociado } from './types'
import AsociadoFeedback from './AsociadoFeedback'
import CambiarEstadoAsociado from './CambiarEstadoAsociado'

function Dato({
  label,
  children,
  icon,
  wide = false,
}: {
  label: string
  children: ReactNode
  icon?: ReactNode
  wide?: boolean
}) {
  return (
    <div className={`asociado-detalle__dato${wide ? ' asociado-detalle__dato--wide' : ''}`}>
      <dt>
        {icon ? <span className="asociado-detalle__dato-icon" aria-hidden="true">{icon}</span> : null}
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  )
}

export default function AsociadoDetallePage() {
  const { id } = useParams()
  const asociadoId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [asociado, setAsociado] = useState<Asociado | null>(null)
  const [resultado, setResultado] = useState<{
    clave: string
    error: string | null
    reintentable: boolean
  }>({ clave: '', error: null, reintentable: true })
  const [recarga, setRecarga] = useState(0)
  const idValido = Number.isInteger(asociadoId) && asociadoId > 0
  const clave = `${asociadoId}:${recarga}`
  const cargando = idValido && resultado.clave !== clave
  const error = !idValido
    ? 'El asociado indicado no existe o fue eliminado.'
    : cargando
      ? null
      : resultado.error
  // Al volver se conservan la búsqueda, el filtro y la página del listado.
  const volverA = (location.state as { from?: string } | null)?.from ?? ASOCIADOS_PATH
  const volverLabel = volverA.includes('/historial') ? 'Historial de asociados' : ASOCIADOS_TITLE
  const [aviso, setAviso] = useState<string | null>(
    (location.state as { success?: string } | null)?.success ?? null,
  )
  const [accionError, setAccionError] = useState<string | null>(null)

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  useEffect(() => {
    if (!idValido) return undefined
    const controller = new AbortController()
    getAsociado(asociadoId, controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return
        setAsociado(respuesta)
        setResultado({ clave, error: null, reintentable: true })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (esNoAutenticado(err)) {
          salirPorSesion()
          return
        }
        setResultado({
          clave,
          error: asociadoConsultaError(err, 'No fue posible cargar el asociado.'),
          reintentable: esReintentable(err),
        })
      })
    return () => controller.abort()
  }, [clave, asociadoId, idValido, salirPorSesion])

  return (
    <main className="asociado-detalle">
      {aviso ? <AsociadoFeedback variant="success">{aviso}</AsociadoFeedback> : null}
      {accionError ? <AsociadoFeedback variant="error">{accionError}</AsociadoFeedback> : null}

      <Link to={volverA} className="asociado-detalle__back">
        <IconArrowLeft size={18} aria-hidden="true" />
        Volver a {volverLabel}
      </Link>

      {cargando ? (
        <div className="asociado-detalle__skeleton" role="status">
          <span className="sr-only">Cargando asociado…</span>
          {[0, 1, 2].map((fila) => (
            <div key={fila} className="asociado-detalle__skeleton-bar" aria-hidden="true" />
          ))}
        </div>
      ) : error || !asociado ? (
        <div className="asociado-detalle__error" role="alert">
          <p>{error ?? 'No fue posible cargar el asociado.'}</p>
          <div className="asociado-detalle__error-actions">
            {idValido && resultado.reintentable ? (
              <button
                type="button"
                className="asociado-detalle__btn asociado-detalle__btn--ghost"
                onClick={() => setRecarga((n) => n + 1)}
              >
                <IconRefresh size={18} aria-hidden="true" />
                Reintentar
              </button>
            ) : null}
            <Link to={volverA} className="asociado-detalle__btn asociado-detalle__btn--ghost">
              <IconArrowLeft size={18} aria-hidden="true" />
              Volver al listado
            </Link>
          </div>
        </div>
      ) : (
        <>
          <header className="asociado-detalle__header">
            <div className="asociado-detalle__identity">
              <span className="asociado-detalle__avatar" aria-hidden="true">
                <IconUser size={28} />
              </span>
              <div className="asociado-detalle__identity-copy">
                <p className="asociado-detalle__eyebrow">Asociados · Detalle</p>
                <h1>{nombreCompleto(asociado)}</h1>
                <div className="asociado-detalle__meta">
                  <span className="asociado-detalle__cedula">{asociado.cedula}</span>
                  <EstadoAsociadoBadge activo={asociado.activo} />
                </div>
              </div>
            </div>
            <div className="asociado-detalle__actions">
              <CambiarEstadoAsociado
                asociado={asociado}
                onCambiado={(actualizado) => {
                  setAccionError(null)
                  setAsociado(actualizado)
                  setAviso(
                    actualizado.activo
                      ? 'El asociado fue reactivado correctamente.'
                      : 'El asociado fue inactivado correctamente.',
                  )
                }}
                onError={(mensaje) => {
                  setAviso(null)
                  setAccionError(mensaje)
                }}
                onNoAutenticado={salirPorSesion}
              />
              <Link
                to={asociadoEditPath(asociado.id)}
                state={{ from: volverA }}
                className="asociado-detalle__btn asociado-detalle__btn--primary"
              >
                <IconEdit size={18} aria-hidden="true" />
                Editar asociado
              </Link>
            </div>
          </header>

          <section
            className="asociado-detalle__panel"
            aria-labelledby="asociado-info-title"
          >
            <div className="asociado-detalle__panel-head">
              <h2 id="asociado-info-title">Información del asociado</h2>
              <p>Datos personales, contacto y estado del registro.</p>
            </div>
            <dl className="asociado-detalle__grid">
              <Dato label="Cédula" icon={<IconId size={15} />}>
                {asociado.cedula}
              </Dato>
              <Dato label="Nombre" icon={<IconUser size={15} />}>
                {asociado.nombre}
              </Dato>
              <Dato label="Apellidos" icon={<IconUser size={15} />}>
                {asociado.apellidos}
              </Dato>
              <Dato label="Correo electrónico" icon={<IconMail size={15} />}>
                {asociado.correoElectronico}
              </Dato>
              <Dato label="Estado">
                {asociado.activo ? 'Activo' : 'Inactivo'}
              </Dato>
              <Dato label="Fecha de registro" icon={<IconCalendar size={15} />}>
                {formatearFecha(asociado.fechaRegistro)}
              </Dato>
              {asociado.fechaInactivacion ? (
                <Dato label="Fecha de inactivación" icon={<IconCalendar size={15} />}>
                  {formatearFecha(asociado.fechaInactivacion)}
                </Dato>
              ) : null}
              {!asociado.activo && asociado.motivoInactivacion ? (
                <Dato
                  label="Motivo de la inactivación"
                  icon={<IconUserOff size={15} />}
                  wide
                >
                  {asociado.motivoInactivacion}
                </Dato>
              ) : null}
            </dl>
          </section>
        </>
      )}
    </main>
  )
}
