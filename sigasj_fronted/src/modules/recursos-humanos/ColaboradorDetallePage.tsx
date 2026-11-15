import {
  IconArrowLeft,
  IconBeach,
  IconBriefcase,
  IconCalendar,
  IconCalendarOff,
  IconHistory,
  IconId,
  IconInfoCircle,
  IconKey,
  IconMail,
  IconPencil,
  IconRefresh,
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
  formatearFechaAuditoria,
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
    <div className="group grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bfe3fa] hover:shadow-[0_8px_20px_rgba(30,90,156,0.08)]">
      <span className="mt-0.5 grid size-9 place-items-center rounded-xl bg-[#eaf6ff] text-[#1e5a9c] transition-colors group-hover:bg-[#d9effc]">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-slate-500 transition-colors group-hover:text-[#1e5a9c]">
          {label}
        </dt>
        <dd className="m-0 break-words font-bold text-[#073b73]">{children}</dd>
      </div>
    </div>
  )
}

const tabClass = (active: boolean) =>
  `group inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition-all duration-200 sm:flex-none sm:min-w-[11rem] sm:px-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e5a9c] active:translate-y-0 active:scale-[0.97] ${
    active
      ? 'border border-transparent bg-gradient-to-r from-blue-700 to-sky-500 text-white shadow-[0_10px_22px_rgba(30,90,156,0.28)] hover:-translate-y-0.5 hover:from-blue-800 hover:to-sky-600 hover:shadow-[0_14px_28px_rgba(30,90,156,0.34)]'
      : 'border border-[#bfe3fa] bg-white text-[#1e5a9c] shadow-[0_4px_12px_rgba(30,90,156,0.08)] hover:-translate-y-0.5 hover:border-blue-400 hover:bg-[#eaf6ff] hover:shadow-[0_8px_18px_rgba(30,90,156,0.14)]'
  }`

const badgeEventoClass = (tipo: TipoEventoHistorialRrhh) => {
  if (tipo === 'PERMISO') return 'border-[#bfe3fa] bg-sky-50 text-sky-800'
  if (tipo === 'VACACION') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  return 'border-amber-200 bg-amber-50 text-amber-900'
}

const primaryBtnClass =
  'group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-blue-700 to-sky-500 px-5 py-3 font-extrabold text-white no-underline shadow-[0_10px_22px_rgba(30,90,156,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-sky-600 hover:text-white hover:shadow-[0_14px_28px_rgba(30,90,156,0.34)] hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e5a9c] active:translate-y-0 active:scale-[0.97]'

const secondaryBtnClass =
  'group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#bfe3fa] bg-white px-5 py-3 font-extrabold text-[#1e5a9c] no-underline shadow-[0_4px_12px_rgba(30,90,156,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-[#eaf6ff] hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e5a9c] active:translate-y-0 active:scale-[0.97]'

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

          <header className="flex flex-col gap-6 overflow-visible rounded-2xl border border-white/80 bg-gradient-to-br from-white via-white to-sky-50/70 px-5 py-6 shadow-[0_16px_40px_rgba(30,90,156,0.10)] ring-1 ring-sky-100 sm:rounded-3xl sm:p-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#1e5a9c] to-sky-600 text-white shadow-[0_10px_22px_rgba(30,90,156,0.28)]">
                <IconUser size={28} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#1e5a9c]">
                  {RRHH_TITLE} · Detalle
                </p>
                <h1 className="m-0 break-words text-2xl font-black tracking-tight text-[#1e5a9c] sm:text-3xl">
                  {nombreCompleto(colaborador)}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-slate-500">
                  <span className="font-semibold">{colaborador.cargo}</span>
                  <span aria-hidden="true">·</span>
                  <EstadoBadge activo={colaborador.activo} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-[0_8px_24px_rgba(30,90,156,0.07)] backdrop-blur-sm">
              <Link to={colaboradorEditPath(colaborador.id)} className={primaryBtnClass}>
                <IconPencil
                  className="transition-transform duration-200 group-hover:-rotate-6"
                  size={19}
                  aria-hidden="true"
                />
                Editar
              </Link>

              <span className="hidden h-8 w-px bg-slate-200 sm:block" aria-hidden="true" />

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
            className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-[0_8px_24px_rgba(30,90,156,0.07)] backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center"
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
            <section className="grid gap-6 rounded-2xl border border-white/80 bg-white px-5 py-6 shadow-[0_16px_38px_rgba(30,90,156,0.09)] ring-1 ring-sky-100 sm:rounded-3xl sm:p-8">
              <div className="flex items-center gap-3 border-b border-[#d7e5f1] pb-4">
                <span
                  className="grid size-9 place-items-center rounded-xl bg-[#eaf6ff] text-[#1e5a9c]"
                  aria-hidden="true"
                >
                  <IconInfoCircle size={20} />
                </span>
                <h2 className="m-0 text-xl font-black tracking-tight text-[#073b73]">
                  Información del colaborador
                </h2>
              </div>

              <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
                <div className="grid place-items-center rounded-2xl border border-[#d7e5f1] bg-gradient-to-br from-[#eaf6ff] to-white p-6">
                  <span className="grid size-28 place-items-center rounded-full bg-white text-[#1e5a9c] shadow-[0_8px_20px_rgba(30,90,156,0.12)] ring-4 ring-[#d9effc]">
                    <IconUser size={48} aria-hidden="true" />
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
                    {colaborador.correoElectronico}
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
            </section>
          ) : null}

          {tab === 'asignacion' ? (
            <section className="grid gap-6 rounded-2xl border border-white/80 bg-white px-5 py-6 shadow-[0_16px_38px_rgba(30,90,156,0.09)] ring-1 ring-sky-100 sm:rounded-3xl sm:p-8">
              <div className="flex items-center gap-3 border-b border-[#d7e5f1] pb-4">
                <span
                  className="grid size-9 place-items-center rounded-xl bg-[#eaf6ff] text-[#1e5a9c]"
                  aria-hidden="true"
                >
                  <IconKey size={20} />
                </span>
                <h2 className="m-0 text-xl font-black tracking-tight text-[#073b73]">
                  Asignación y permisos
                </h2>
              </div>

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
                  className="group flex min-h-14 items-center gap-3 rounded-2xl border border-[#bfe3fa] bg-gradient-to-br from-white to-[#eaf6ff] px-4 font-extrabold text-[#1e5a9c] no-underline shadow-[0_6px_16px_rgba(30,90,156,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(30,90,156,0.14)] hover:no-underline"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-white text-[#1e5a9c] shadow-sm">
                    <IconKey size={20} aria-hidden="true" />
                  </span>
                  Permisos
                </Link>
                <Link
                  to={vacacionesColaboradorPath(colaborador.id)}
                  className="group flex min-h-14 items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 px-4 font-extrabold text-emerald-800 no-underline shadow-[0_6px_16px_rgba(5,150,105,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(5,150,105,0.14)] hover:no-underline"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
                    <IconBeach size={20} aria-hidden="true" />
                  </span>
                  Vacaciones
                </Link>
                <Link
                  to={`${INCAPACIDADES_PATH}?colaboradorId=${colaborador.id}`}
                  className="group flex min-h-14 items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 px-4 font-extrabold text-amber-900 no-underline shadow-[0_6px_16px_rgba(217,119,6,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(217,119,6,0.14)] hover:no-underline"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-white text-amber-800 shadow-sm">
                    <IconCalendarOff size={20} aria-hidden="true" />
                  </span>
                  Incapacidades
                </Link>
              </div>
            </section>
          ) : null}

          {tab === 'historial' ? (
            <section className="grid gap-5 rounded-2xl border border-white/80 bg-white px-5 py-6 shadow-[0_16px_38px_rgba(30,90,156,0.09)] ring-1 ring-sky-100 sm:rounded-3xl sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d7e5f1] pb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-9 place-items-center rounded-xl bg-[#eaf6ff] text-[#1e5a9c]"
                    aria-hidden="true"
                  >
                    <IconHistory size={20} />
                  </span>
                  <h2 className="m-0 text-xl font-black tracking-tight text-[#073b73]">
                    Historial del colaborador
                  </h2>
                </div>
                <Link
                  to={colaboradorHistorialPath(colaborador.id)}
                  className={secondaryBtnClass}
                >
                  <IconHistory size={18} aria-hidden="true" />
                  Historial
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
                      className={secondaryBtnClass + ' w-fit'}
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
                      className="grid gap-2 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 px-4 py-3.5 shadow-[0_4px_14px_rgba(30,90,156,0.05)]"
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
                      <p className="m-0 font-bold text-[#073b73]">
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
                  <IconHistory
                    className="transition-transform group-hover:scale-110"
                    size={19}
                    aria-hidden="true"
                  />
                  Ver historial completo
                </Link>
              </div>
            </section>
          ) : null}
        </>
      )}
    </main>
  )
}
