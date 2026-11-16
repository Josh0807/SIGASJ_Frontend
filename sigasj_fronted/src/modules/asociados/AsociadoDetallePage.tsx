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
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { ADMIN_COPY } from '../../shared/admin/adminCopy'
import {
  AdminShell,
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from '../../shared/ui'
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
    <AdminShell
      className="asociado-detalle gap-5"
      aria-labelledby="asociado-detalle-title"
    >
      {aviso ? <Alert tone="success">{aviso}</Alert> : null}
      {accionError ? <Alert tone="danger">{accionError}</Alert> : null}

      {cargando ? (
        <Alert tone="info">{ADMIN_COPY.loading('el asociado')}</Alert>
      ) : error || !asociado ? (
        <EmptyState
          title={error ?? ADMIN_COPY.loadError('el asociado')}
          actions={
            <>
              {idValido && resultado.reintentable ? (
                <Button
                  type="button"
                  variant="secondary"
                  leftIcon={<IconRefresh size={17} aria-hidden="true" />}
                  onClick={() => setRecarga((n) => n + 1)}
                >
                  {ADMIN_COPY.retry}
                </Button>
              ) : null}
              <Button
                to={volverA}
                variant="secondary"
                leftIcon={<IconArrowLeft size={17} aria-hidden="true" />}
              >
                Volver a {volverLabel}
              </Button>
            </>
          }
        />
      ) : (
        <>
          <PageHeader
            id="asociado-detalle-title"
            eyebrow="Asociados · Detalle"
            title={
              <span className="inline-flex flex-wrap items-center gap-2">
                <IconUser size={20} aria-hidden="true" />
                {nombreCompleto(asociado)}
              </span>
            }
            description={
              <span className="inline-flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm">{asociado.cedula}</span>
                <EstadoAsociadoBadge activo={asociado.activo} />
              </span>
            }
            actions={
              <>
                <Button
                  to={volverA}
                  variant="secondary"
                  leftIcon={<IconArrowLeft size={17} aria-hidden="true" />}
                >
                  {ADMIN_COPY.backToList}
                </Button>
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
                <Button
                  to={asociadoEditPath(asociado.id)}
                  state={{ from: volverA }}
                  variant="primary"
                  leftIcon={<IconEdit size={17} aria-hidden="true" />}
                >
                  {ADMIN_COPY.edit} asociado
                </Button>
              </>
            }
          />

          <Card
            as="section"
            padded
            className="asociado-detalle__panel"
            aria-labelledby="asociado-info-title"
          >
            <div className="asociado-detalle__panel-head">
              <h2 id="asociado-info-title" className="m-0 text-lg font-extrabold text-sigasj-ink">
                Información del asociado
              </h2>
              <p className="m-0 mt-1 text-sm text-sigasj-muted">
                Datos personales, contacto y estado del registro.
              </p>
            </div>
            <dl className="asociado-detalle__grid mt-5">
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
          </Card>
        </>
      )}
    </AdminShell>
  )
}
