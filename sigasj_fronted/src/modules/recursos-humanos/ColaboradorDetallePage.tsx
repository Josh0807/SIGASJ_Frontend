import {
  IconArrowLeft,
  IconBeach,
  IconBriefcase,
  IconCalendar,
  IconCalendarOff,
  IconClockHour4,
  IconCoin,
  IconHistory,
  IconId,
  IconInfoCircle,
  IconKey,
  IconMail,
  IconPencil,
  IconRefresh,
  IconTimeline,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { useAuth } from '../auth/components/AuthContext'
import CambiarEstadoColaborador from './CambiarEstadoColaborador'
import EstadoBadge from './EstadoBadge'
import { getColaborador } from './colaboradoresApi'
import {
  colaboradorErrorMessage,
  esNoAutenticado,
  esReintentable,
  etiquetaJornada,
  etiquetaModalidadPago,
  formatearFechaAuditoria,
  formatearFechaIngreso,
  nombreCompleto,
} from './colaboradorForm'
import {
  detalleEventoHistorial,
  etiquetaTipoEvento,
  formatearFechaEvento,
  historialErrorMessage,
} from './historialColaborador'
import { getHistorialColaborador } from './historialColaboradorApi'
import {
  INCAPACIDADES_PATH,
  PERMISOS_PATH,
  RRHH_PATH,
  RRHH_TITLE,
  colaboradorEditPath,
  colaboradorHistorialPath,
  vacacionesColaboradorPath,
} from './recursosHumanosPaths'
import type {
  Colaborador,
  EventoHistorialColaborador,
  TipoEventoHistorialRrhh,
} from './types'

type DetalleTab = 'informacion' | 'asignacion' | 'historial'

function Dato({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 rounded-2xl border border-[#d7e5f1] bg-[#fbfdff] px-4 py-3.5 transition hover:border-[#b9d0e6] hover:bg-white">
      <span className="mt-0.5 grid size-9 place-items-center rounded-2xl bg-[#eaf6ff] text-[#1e5a9c]">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-slate-500">
          {label}
        </dt>
        <dd className="m-0 break-words text-sm font-semibold text-[#123f70]">{children}</dd>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  icon,
  description,
  children,
}: {
  title: string
  icon: ReactNode
  description?: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-5 rounded-3xl border border-[#d7e5f1] bg-white p-5 shadow-[0_4px_14px_rgba(30,90,156,0.05)] sm:gap-6 sm:p-7">
      <div className="flex items-start gap-3 border-b border-[#e8f1f8] pb-4">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#eaf6ff] text-[#1e5a9c]"
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="m-0 text-lg font-extrabold tracking-tight text-[#123f70] sm:text-xl">
            {title}
          </h2>
          {description ? (
            <p className="m-0 mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  )
}

const iniciales = (nombre: string, apellidos: string) => {
  const a = nombre.trim().charAt(0)
  const b = apellidos.trim().charAt(0)
  return `${a}${b}`.toUpperCase() || '?'
}

const tabClass = (active: boolean) =>
  `inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e5a9c] sm:flex-none sm:min-w-[10.5rem] ${
    active
      ? 'bg-[#1e5a9c] text-white shadow-[0_6px_16px_rgba(30,90,156,0.22)]'
      : 'border border-[#d7e5f1] bg-white text-[#1e5a9c] hover:border-[#1e5a9c] hover:bg-[#f3f9fd]'
  }`

const badgeEventoClass = (tipo: TipoEventoHistorialRrhh) => {
  if (tipo === 'PERMISO') return 'border-[#bfe3fa] bg-sky-50 text-sky-800'
  if (tipo === 'VACACION') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  return 'border-amber-200 bg-amber-50 text-amber-900'
}

const primaryBtnClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-transparent bg-[#1e5a9c] px-5 py-2.5 font-bold text-white no-underline shadow-[0_6px_16px_rgba(30,90,156,0.2)] transition hover:bg-[#174f87] hover:text-white hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e5a9c]'

const secondaryBtnClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#d7e5f1] bg-white px-5 py-2.5 font-bold text-[#1e5a9c] no-underline transition hover:border-[#1e5a9c] hover:bg-[#f3f9fd] hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e5a9c]'
export default function ColaboradorDetallePage() {
  const { id } = useParams()
  const colaboradorId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [colaborador, setColaborador] = useState<Colaborador | null>(null)
  const [resultado, setResultado] = useState<{
    clave: string
    error: string | null
    reintentable: boolean
  }>({ clave: '', error: null, reintentable: true })
  const [accionError, setAccionError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(
    (location.state as { success?: string } | null)?.success ?? null,
  )
  const [recarga, setRecarga] = useState(0)
  const [tab, setTab] = useState<DetalleTab>('informacion')
  const [historial, setHistorial] = useState<EventoHistorialColaborador[] | null>(
    null,
  )
  const [historialEstado, setHistorialEstado] = useState<{
    clave: string
    error: string | null
    reintentable: boolean
  }>({ clave: '', error: null, reintentable: true })
  const [historialRecarga, setHistorialRecarga] = useState(0)
  const idValido = Number.isInteger(colaboradorId) && colaboradorId > 0
  const clave = `${colaboradorId}:${recarga}`
  const historialClave = `${colaboradorId}:historial:${historialRecarga}`
  const cargando = idValido && resultado.clave !== clave
  const cargandoHistorial =
    tab === 'historial' && idValido && historialEstado.clave !== historialClave
  const error = !idValido
    ? 'El colaborador indicado no existe o fue eliminado.'
    : cargando
      ? null
      : resultado.error

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  useEffect(() => {
    if (!idValido) return undefined
    const controller = new AbortController()
    getColaborador(colaboradorId, controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return
        setColaborador(respuesta)
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
          error: colaboradorErrorMessage(err, 'No fue posible cargar el colaborador.'),
          reintentable: esReintentable(err),
        })
      })
    return () => controller.abort()
  }, [clave, colaboradorId, idValido, salirPorSesion])

  useEffect(() => {
    if (!idValido || tab !== 'historial') return undefined
    const controller = new AbortController()
    getHistorialColaborador(
      colaboradorId,
      { tipo: '', fechaDesde: '', fechaHasta: '', page: 1 },
      controller.signal,
    )
      .then((data) => {
        if (controller.signal.aborted) return
        setHistorial(data.historial)
        setHistorialEstado({ clave: historialClave, error: null, reintentable: true })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (esNoAutenticado(err)) {
          salirPorSesion()
          return
        }
        setHistorialEstado({
          clave: historialClave,
          error: historialErrorMessage(
            err,
            'No fue posible cargar el historial. Intente nuevamente.',
          ),
          reintentable: esReintentable(err),
        })
      })
    return () => controller.abort()
  }, [colaboradorId, historialClave, idValido, salirPorSesion, tab])

  return (
    <main className="grid w-full min-w-0 gap-5 sm:gap-6">
      <Link
        to={RRHH_PATH}
        className="group inline-flex min-h-11 w-fit items-center gap-2.5 rounded-2xl border border-[#bfe3fa] bg-white px-4 py-2.5 font-extrabold text-[#1e5a9c] no-underline shadow-[0_6px_18px_rgba(30,90,156,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-[#eaf6ff] hover:text-blue-800 hover:no-underline hover:shadow-[0_10px_24px_rgba(30,90,156,0.18)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#1e5a9c] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
      >
        <IconArrowLeft
          className="transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:transform-none"
          size={19}
          aria-hidden="true"
        />
        Volver a {RRHH_TITLE}
      </Link>

      {cargando ? (
        <div
          className="grid gap-4 rounded-2xl border border-[#d7e5f1] bg-white p-6 sm:rounded-3xl sm:p-8"
          role="status"
        >
          <span className="sr-only">Cargando colaborador…</span>
          {[0, 1, 2].map((fila) => (
            <div
              key={fila}
              className="h-14 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : error || !colaborador ? (
        <div
          className="grid place-items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center sm:rounded-3xl"
          role="alert"
        >
          <p className="m-0 font-semibold text-red-800">
            {error ?? 'No fue posible cargar el colaborador.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {idValido && resultado.reintentable ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#bfe3fa] bg-white px-5 font-bold text-blue-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-[#eaf6ff]"
                onClick={() => setRecarga((n) => n + 1)}
              >
                <IconRefresh size={18} aria-hidden="true" />
                Reintentar
              </button>
            ) : null}
            <Link
              to={RRHH_PATH}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 font-bold text-slate-700 no-underline hover:no-underline"
            >
              <IconArrowLeft size={18} aria-hidden="true" />
              Volver al listado
            </Link>
          </div>
        </div>
      ) : (
        <>
          {aviso ? (
            <div
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-semibold text-emerald-800"
              role="status"
            >
              {aviso}
            </div>
          ) : null}
          {accionError ? (
            <div
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-800"
              role="alert"
            >
              {accionError}
            </div>
          ) : null}

          <header className="flex flex-col gap-5 rounded-3xl border border-[#d7e5f1] bg-white p-5 shadow-[0_4px_14px_rgba(30,90,156,0.05)] sm:p-7 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span
                className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#1e5a9c] text-base font-extrabold tracking-wide text-white shadow-[0_8px_18px_rgba(30,90,156,0.22)]"
                aria-hidden="true"
              >
                {iniciales(colaborador.nombre, colaborador.apellidos)}
              </span>
              <div className="min-w-0">
                <p className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[#1e5a9c]">
                  {RRHH_TITLE} · Detalle
                </p>
                <h1 className="m-0 break-words text-2xl font-extrabold tracking-tight text-[#123f70] sm:text-[1.75rem]">
                  {nombreCompleto(colaborador)}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-slate-500">
                  <span className="font-semibold text-[#1a2f42]">{colaborador.cargo}</span>
                  <span aria-hidden="true">·</span>
                  <EstadoBadge activo={colaborador.activo} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-[#e8f1f8] bg-[#f7fbfe] p-2.5">
              <Link to={colaboradorEditPath(colaborador.id)} className={primaryBtnClass}>
                <IconPencil size={18} aria-hidden="true" />
                Editar
              </Link>

              <Link
                to={colaboradorHistorialPath(colaborador.id)}
                className={secondaryBtnClass}
              >
                <IconHistory size={18} aria-hidden="true" />
                Historial
              </Link>

              <CambiarEstadoColaborador
                colaborador={colaborador}
                onCambiado={(actualizado) => {
                  setAccionError(null)
                  setColaborador(actualizado)
                  setAviso(
                    `El colaborador quedó ${actualizado.activo ? 'activo' : 'inactivo'}.`,
                  )
                }}
                onError={(mensaje) => {
                  setAviso(null)
                  setAccionError(mensaje)
                }}
                onNoAutenticado={salirPorSesion}
              />
            </div>
          </header>

          <nav
            className="flex flex-col gap-2 rounded-3xl border border-[#d7e5f1] bg-white p-2.5 shadow-[0_4px_14px_rgba(30,90,156,0.05)] sm:flex-row sm:flex-wrap sm:items-center"
            aria-label="Secciones del colaborador"
          >
            <button
              type="button"
              className={tabClass(tab === 'informacion')}
              aria-pressed={tab === 'informacion'}
              onClick={() => setTab('informacion')}
            >
              <IconUser size={18} aria-hidden="true" />
              Información
            </button>
            <button
              type="button"
              className={tabClass(tab === 'asignacion')}
              aria-pressed={tab === 'asignacion'}
              onClick={() => setTab('asignacion')}
            >
              <IconKey size={18} aria-hidden="true" />
              Asignación y permisos
            </button>
            <button
              type="button"
              className={tabClass(tab === 'historial')}
              aria-pressed={tab === 'historial'}
              onClick={() => setTab('historial')}
            >
              <IconHistory size={18} aria-hidden="true" />
              Historial
            </button>
          </nav>

          {tab === 'informacion' ? (
            <div className="grid gap-5">
              <SectionCard
                title="Información del colaborador"
                icon={<IconInfoCircle size={20} />}
              >
                <div className="grid gap-5 lg:grid-cols-[11rem_minmax(0,1fr)] lg:items-start">
                  <div className="grid place-items-center rounded-3xl border border-[#d7e5f1] bg-[#f7fbfe] p-5">
                    <span
                      className="grid size-24 place-items-center rounded-full bg-[#1e5a9c] text-2xl font-extrabold tracking-wide text-white shadow-[0_8px_18px_rgba(30,90,156,0.2)]"
                      aria-hidden="true"
                    >
                      {iniciales(colaborador.nombre, colaborador.apellidos)}
                    </span>
                  </div>

                  <dl className="m-0 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <Dato label="Cédula" icon={<IconId size={18} aria-hidden="true" />}>
                      {colaborador.cedula}
                    </Dato>
                    <Dato label="Nombre" icon={<IconUser size={18} aria-hidden="true" />}>
                      {colaborador.nombre}
                    </Dato>
                    <Dato label="Apellidos" icon={<IconUser size={18} aria-hidden="true" />}>
                      {colaborador.apellidos}
                    </Dato>
                    <Dato
                      label="Correo electrónico"
                      icon={<IconMail size={18} aria-hidden="true" />}
                    >
                      <span className="break-all">{colaborador.correoElectronico}</span>
                    </Dato>
                    <Dato label="Cargo" icon={<IconBriefcase size={18} aria-hidden="true" />}>
                      {colaborador.cargo}
                    </Dato>
                    <Dato label="Estado" icon={<IconUserCircle size={18} aria-hidden="true" />}>
                      <EstadoBadge activo={colaborador.activo} />
                    </Dato>
                    <Dato
                      label="Cuenta de usuario"
                      icon={<IconKey size={18} aria-hidden="true" />}
                    >
                      {colaborador.usuario
                        ? `${colaborador.usuario.nombre} · ${colaborador.usuario.correo}`
                        : 'Sin cuenta vinculada'}
                    </Dato>
                    <Dato label="Registrado" icon={<IconCalendar size={18} aria-hidden="true" />}>
                      {formatearFechaAuditoria(colaborador.createdAt)}
                    </Dato>
                    <Dato
                      label="Última actualización"
                      icon={<IconCalendar size={18} aria-hidden="true" />}
                    >
                      {formatearFechaAuditoria(colaborador.updatedAt)}
                    </Dato>
                  </dl>
                </div>
              </SectionCard>

              <SectionCard
                title="Información laboral"
                icon={<IconBriefcase size={20} />}
                description="Expediente laboral distinto de la fecha de registro en SIGASJ."
              >
                <dl className="m-0 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <Dato
                    label="Fecha de ingreso"
                    icon={<IconCalendar size={18} aria-hidden="true" />}
                  >
                    {formatearFechaIngreso(colaborador.fechaIngreso)}
                  </Dato>
                  <Dato
                    label="Antigüedad"
                    icon={<IconTimeline size={18} aria-hidden="true" />}
                  >
                    {colaborador.antiguedad?.etiqueta ?? 'Sin fecha de ingreso'}
                  </Dato>
                  <Dato
                    label="Jornada laboral"
                    icon={<IconClockHour4 size={18} aria-hidden="true" />}
                  >
                    {etiquetaJornada(colaborador.jornadaLaboral)}
                  </Dato>
                  <Dato
                    label="Días laborales habituales"
                    icon={<IconCalendar size={18} aria-hidden="true" />}
                  >
                    {colaborador.diasLaboralesHabituales != null
                      ? `${colaborador.diasLaboralesHabituales} por semana`
                      : '—'}
                  </Dato>
                  <Dato
                    label="Modalidad de pago"
                    icon={<IconCoin size={18} aria-hidden="true" />}
                  >
                    {etiquetaModalidadPago(colaborador.modalidadPago)}
                  </Dato>
                </dl>
              </SectionCard>
            </div>
          ) : null}

          {tab === 'asignacion' ? (
            <SectionCard
              title="Asignación y permisos"
              icon={<IconKey size={20} />}
            >
              <dl className="m-0 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Dato label="Cargo" icon={<IconBriefcase size={18} aria-hidden="true" />}>
                  {colaborador.cargo}
                </Dato>
                <Dato
                  label="Cuenta de usuario"
                  icon={<IconKey size={18} aria-hidden="true" />}
                >
                  {colaborador.usuario
                    ? `${colaborador.usuario.nombre} · ${colaborador.usuario.correo}`
                    : 'Sin cuenta vinculada'}
                </Dato>
                <Dato label="Estado" icon={<IconUserCircle size={18} aria-hidden="true" />}>
                  <EstadoBadge activo={colaborador.activo} />
                </Dato>
              </dl>

              <div className="grid gap-3 sm:grid-cols-3">
                <Link
                  to={`${PERMISOS_PATH}?colaboradorId=${colaborador.id}`}
                  className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#d7e5f1] bg-[#f7fbfe] px-4 font-bold text-[#1e5a9c] no-underline transition hover:border-[#1e5a9c] hover:bg-white hover:no-underline"
                >
                  <span className="grid size-10 place-items-center rounded-2xl bg-white text-[#1e5a9c] shadow-sm">
                    <IconKey size={20} aria-hidden="true" />
                  </span>
                  Permisos
                </Link>
                <Link
                  to={vacacionesColaboradorPath(colaborador.id)}
                  className="flex min-h-14 items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 font-bold text-emerald-800 no-underline transition hover:border-emerald-400 hover:bg-white hover:no-underline"
                >
                  <span className="grid size-10 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                    <IconBeach size={20} aria-hidden="true" />
                  </span>
                  Vacaciones
                </Link>
                <Link
                  to={`${INCAPACIDADES_PATH}?colaboradorId=${colaborador.id}`}
                  className="flex min-h-14 items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 font-bold text-amber-900 no-underline transition hover:border-amber-400 hover:bg-white hover:no-underline"
                >
                  <span className="grid size-10 place-items-center rounded-2xl bg-white text-amber-800 shadow-sm">
                    <IconCalendarOff size={20} aria-hidden="true" />
                  </span>
                  Incapacidades
                </Link>
              </div>
            </SectionCard>
          ) : null}

          {tab === 'historial' ? (
            <SectionCard
              title="Historial del colaborador"
              icon={<IconHistory size={20} />}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="m-0 text-sm text-slate-500">
                  Últimos eventos registrados para este colaborador.
                </p>
                <Link
                  to={colaboradorHistorialPath(colaborador.id)}
                  className={secondaryBtnClass}
                >
                  <IconHistory size={18} aria-hidden="true" />
                  Historial completo
                </Link>
              </div>

              {cargandoHistorial ? (
                <div className="grid gap-3" role="status">
                  <span className="sr-only">Cargando historial…</span>
                  {[0, 1, 2].map((fila) => (
                    <div
                      key={fila}
                      className="h-16 animate-pulse rounded-2xl bg-slate-100 motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              ) : historialEstado.error ? (
                <div
                  className="grid gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
                  role="alert"
                >
                  <p className="m-0 font-semibold text-red-800">{historialEstado.error}</p>
                  {historialEstado.reintentable ? (
                    <button
                      type="button"
                      className={`${secondaryBtnClass} w-fit`}
                      onClick={() => setHistorialRecarga((n) => n + 1)}
                    >
                      <IconRefresh size={18} aria-hidden="true" />
                      Reintentar
                    </button>
                  ) : null}
                </div>
              ) : !historial?.length ? (
                <div className="rounded-2xl border border-dashed border-[#bfe3fa] bg-[#f7fbff] px-5 py-8 text-center text-slate-600">
                  No hay eventos registrados para este colaborador.
                </div>
              ) : (
                <ol className="m-0 grid list-none gap-3 p-0">
                  {historial.slice(0, 6).map((evento) => (
                    <li
                      key={`${evento.tipo}-${evento.id}`}
                      className="grid gap-2 rounded-2xl border border-[#d7e5f1] bg-[#fbfdff] px-4 py-3.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-extrabold ${badgeEventoClass(evento.tipo)}`}
                        >
                          {etiquetaTipoEvento(evento.tipo)}
                        </span>
                        <time className="text-sm font-semibold text-slate-500">
                          {formatearFechaEvento(evento.fecha)}
                        </time>
                      </div>
                      <p className="m-0 font-semibold text-[#123f70]">
                        {detalleEventoHistorial(evento)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  to={colaboradorHistorialPath(colaborador.id)}
                  className={primaryBtnClass}
                >
                  <IconHistory size={18} aria-hidden="true" />
                  Ver historial completo
                </Link>
              </div>
            </SectionCard>
          ) : null}
        </>
      )}
    </main>
  )
}
