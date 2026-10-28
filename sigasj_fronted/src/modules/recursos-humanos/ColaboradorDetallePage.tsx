import {
  IconArrowLeft,
  IconBeach,
  IconCalendarOff,
  IconChevronDown,
  IconDots,
  IconHistory,
  IconPencil,
  IconRefresh,
  IconUser,
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
  INCAPACIDADES_PATH,
  RRHH_PATH,
  RRHH_TITLE,
  colaboradorEditPath,
  colaboradorHistorialPath,
  vacacionesColaboradorPath,
} from './recursosHumanosPaths'
import type { Colaborador } from './types'

function Dato({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group grid min-w-0 gap-1.5 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_8px_20px_rgba(30,90,156,0.08)]">
      <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500 transition-colors group-hover:text-blue-600">{label}</dt>
      <dd className="m-0 break-words font-bold text-slate-800">{children}</dd>
    </div>
  )
}

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
  const idValido = Number.isInteger(colaboradorId) && colaboradorId > 0
  const clave = `${colaboradorId}:${recarga}`
  const cargando = idValido && resultado.clave !== clave
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

  return (
    <main className="grid w-full min-w-0 gap-5 sm:gap-6">
      <Link
        to={RRHH_PATH}
        className="group inline-flex min-h-11 w-fit items-center gap-2.5 rounded-2xl border border-blue-200 bg-white px-4 py-2.5 font-extrabold text-blue-700 no-underline shadow-[0_6px_18px_rgba(37,99,235,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800 hover:no-underline hover:shadow-[0_10px_24px_rgba(37,99,235,0.18)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-600 active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
      >
        <IconArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:transform-none" size={19} aria-hidden="true" />
        Volver a {RRHH_TITLE}
      </Link>

      {cargando ? (
        <div className="grid gap-4 rounded-2xl border border-sky-100 bg-white p-6 sm:rounded-3xl sm:p-8" role="status">
          <span className="sr-only">Cargando colaborador…</span>
          {[0, 1, 2].map((fila) => (
            <div key={fila} className="h-14 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" aria-hidden="true" />
          ))}
        </div>
      ) : error || !colaborador ? (
        <div className="grid place-items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center sm:rounded-3xl" role="alert">
          <p className="m-0 font-semibold text-red-800">{error ?? 'No fue posible cargar el colaborador.'}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {idValido && resultado.reintentable ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 font-bold text-blue-800 transition hover:bg-blue-50"
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
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-semibold text-emerald-800" role="status">
              {aviso}
            </div>
          ) : null}
          {accionError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-800" role="alert">
              {accionError}
            </div>
          ) : null}

          <header className="flex flex-col gap-6 overflow-visible rounded-2xl border border-white/80 bg-gradient-to-br from-white via-white to-sky-50/70 px-5 py-6 shadow-[0_16px_40px_rgba(30,90,156,0.10)] ring-1 ring-sky-100 sm:rounded-3xl sm:p-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)]">
                <IconUser size={28} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
                  {RRHH_TITLE} · Detalle
                </p>
                <h1 className="m-0 break-words text-2xl font-black tracking-tight text-[#062e63] sm:text-3xl">
                  {nombreCompleto(colaborador)}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-slate-500">
                  <span className="font-semibold">{colaborador.cargo}</span>
                  <EstadoBadge activo={colaborador.activo} />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-[0_8px_24px_rgba(30,90,156,0.07)]">
              <Link
                to={colaboradorEditPath(colaborador.id)}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-blue-700 to-sky-500 px-5 py-3 font-extrabold text-white no-underline shadow-[0_8px_18px_rgba(37,99,235,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-sky-600 hover:text-white hover:shadow-[0_11px_24px_rgba(37,99,235,0.32)] hover:no-underline"
              >
                <IconPencil className="transition-transform group-hover:-rotate-6" size={19} aria-hidden="true" />
                Editar
              </Link>
              <details className="group/menu relative">
                <summary className="inline-flex min-h-12 cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 font-extrabold text-blue-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
                  <IconDots size={20} aria-hidden="true" />
                  Más acciones
                  <IconChevronDown className="transition-transform duration-200 group-open/menu:rotate-180" size={17} aria-hidden="true" />
                </summary>
                <div className="absolute right-0 z-20 mt-2 grid min-w-64 gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
                  <Link
                    to={colaboradorHistorialPath(colaborador.id)}
                    className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 font-bold text-slate-700 no-underline transition hover:bg-blue-50 hover:text-blue-800 hover:no-underline"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-700"><IconHistory size={18} aria-hidden="true" /></span>
                    Historial
                  </Link>
                  <Link
                    to={vacacionesColaboradorPath(colaborador.id)}
                    className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 font-bold text-slate-700 no-underline transition hover:bg-emerald-50 hover:text-emerald-800 hover:no-underline"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><IconBeach size={18} aria-hidden="true" /></span>
                    Vacaciones
                  </Link>
                  <Link
                    to={`${INCAPACIDADES_PATH}?colaboradorId=${colaborador.id}`}
                    className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 font-bold text-slate-700 no-underline transition hover:bg-amber-50 hover:text-amber-900 hover:no-underline"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-800"><IconCalendarOff size={18} aria-hidden="true" /></span>
                    Incapacidades
                  </Link>
                </div>
              </details>
              <span className="hidden h-8 w-px bg-slate-200 sm:block" aria-hidden="true" />
              <CambiarEstadoColaborador
                colaborador={colaborador}
                onCambiado={(actualizado) => {
                  setAccionError(null)
                  setColaborador(actualizado)
                  setAviso(`El colaborador quedó ${actualizado.activo ? 'activo' : 'inactivo'}.`)
                }}
                onError={(mensaje) => {
                  setAviso(null)
                  setAccionError(mensaje)
                }}
                onNoAutenticado={salirPorSesion}
              />
            </div>
          </header>

          <section className="grid gap-6 rounded-2xl border border-white/80 bg-white px-5 py-6 shadow-[0_16px_38px_rgba(30,90,156,0.09)] ring-1 ring-sky-100 sm:rounded-3xl sm:p-8">
            <div className="flex items-center gap-3 border-b border-sky-100 pb-4">
              <span className="h-7 w-1.5 rounded-full bg-gradient-to-b from-blue-600 to-sky-400" aria-hidden="true" />
              <h2 className="m-0 text-xl font-black tracking-tight text-[#073b73]">Información del colaborador</h2>
            </div>
            <dl className="m-0 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Dato label="Cédula">{colaborador.cedula}</Dato>
              <Dato label="Nombre">{colaborador.nombre}</Dato>
              <Dato label="Apellidos">{colaborador.apellidos}</Dato>
              <Dato label="Correo electrónico">{colaborador.correoElectronico}</Dato>
              <Dato label="Cargo">{colaborador.cargo}</Dato>
              <Dato label="Estado">{colaborador.activo ? 'Activo' : 'Inactivo'}</Dato>
              <Dato label="Cuenta de usuario">
                {colaborador.usuario
                  ? `${colaborador.usuario.nombre} · ${colaborador.usuario.correo}`
                  : 'Sin cuenta vinculada'}
              </Dato>
              <Dato label="Registrado">{formatearFechaAuditoria(colaborador.createdAt)}</Dato>
              <Dato label="Última actualización">{formatearFechaAuditoria(colaborador.updatedAt)}</Dato>
            </dl>
          </section>
        </>
      )}
    </main>
  )
}
