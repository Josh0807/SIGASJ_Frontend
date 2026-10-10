import { IconArrowLeft, IconCalendarEvent, IconPencil, IconRefresh } from '@tabler/icons-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { useAuth } from '../auth/components/AuthContext'
import { esNoAutenticado, esReintentable, formatearFechaAuditoria, nombreCompleto } from './colaboradorForm'
import { formatearFechaPermiso, nombreColaboradorPermiso, permisoErrorMessage } from './permisoForm'
import { getPermiso } from './permisosApi'
import { PERMISOS_PATH, RRHH_TITLE, permisoEditPath } from './recursosHumanosPaths'
import type { PermisoColaborador } from './types'

function Dato({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <dt className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="m-0 break-words font-semibold text-slate-800">{children}</dd>
    </div>
  )
}

export default function PermisoDetallePage() {
  const { id } = useParams()
  const permisoId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [permiso, setPermiso] = useState<PermisoColaborador | null>(null)
  const [resultado, setResultado] = useState<{
    clave: string
    error: string | null
    reintentable: boolean
  }>({ clave: '', error: null, reintentable: true })
  const [aviso] = useState<string | null>(
    (location.state as { success?: string } | null)?.success ?? null,
  )
  const [recarga, setRecarga] = useState(0)
  const idValido = Number.isInteger(permisoId) && permisoId > 0
  const clave = `${permisoId}:${recarga}`
  const cargando = idValido && resultado.clave !== clave
  const error = !idValido
    ? 'El permiso indicado no existe o fue eliminado.'
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
    getPermiso(permisoId, controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return
        setPermiso(respuesta)
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
          error: permisoErrorMessage(err, 'No fue posible cargar el permiso.'),
          reintentable: esReintentable(err),
        })
      })
    return () => controller.abort()
  }, [clave, permisoId, idValido, salirPorSesion])

  return (
    <main className="grid w-full min-w-0 gap-5 sm:gap-6">
      <Link
        to={PERMISOS_PATH}
        className="inline-flex w-fit items-center gap-2 font-bold text-blue-700 no-underline hover:underline"
      >
        <IconArrowLeft size={18} aria-hidden="true" />
        Volver a permisos
      </Link>

      {cargando ? (
        <div className="grid gap-4 rounded-2xl border border-sky-100 bg-white p-6 sm:rounded-3xl sm:p-8" role="status">
          <span className="sr-only">Cargando permiso…</span>
          {[0, 1, 2].map((fila) => (
            <div key={fila} className="h-14 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" aria-hidden="true" />
          ))}
        </div>
      ) : error || !permiso ? (
        <div className="grid place-items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center sm:rounded-3xl" role="alert">
          <p className="m-0 font-semibold text-red-800">{error ?? 'No fue posible cargar el permiso.'}</p>
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
              to={PERMISOS_PATH}
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

          <header className="flex flex-col gap-5 rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)]">
                <IconCalendarEvent size={28} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
                  {RRHH_TITLE} · Permiso
                </p>
                <h1 className="m-0 break-words text-2xl font-black tracking-tight text-[#062e63] sm:text-3xl">
                  {nombreColaboradorPermiso(permiso)}
                </h1>
                <p className="mt-2 m-0 font-semibold text-slate-500">{permiso.motivo}</p>
              </div>
            </div>
            <Link
              to={permisoEditPath(permiso.id)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d6e6f8] bg-[#f3f8fe] px-5 py-3 font-bold text-[#1d5fb8] no-underline transition hover:border-[#1d6fd6] hover:bg-[#1d6fd6] hover:text-white hover:no-underline"
            >
              <IconPencil size={19} aria-hidden="true" />
              Editar
            </Link>
          </header>

          <section className="grid gap-5 rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-8">
            <h2 className="m-0 text-lg font-extrabold text-[#073b73]">Información del permiso</h2>
            <dl className="m-0 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <Dato label="Colaborador">{nombreColaboradorPermiso(permiso)}</Dato>
              <Dato label="Cédula">{permiso.colaborador?.cedula ?? '—'}</Dato>
              <Dato label="Cargo">{permiso.colaborador?.cargo ?? '—'}</Dato>
              <Dato label="Fecha de inicio">{formatearFechaPermiso(permiso.fechaInicio)}</Dato>
              <Dato label="Fecha de fin">{formatearFechaPermiso(permiso.fechaFin)}</Dato>
              <Dato label="Motivo">{permiso.motivo}</Dato>
              <Dato label="Observaciones">{permiso.observaciones || 'Sin observaciones'}</Dato>
              <Dato label="Registrado">{formatearFechaAuditoria(permiso.createdAt)}</Dato>
              <Dato label="Última actualización">{formatearFechaAuditoria(permiso.updatedAt)}</Dato>
              {permiso.colaborador ? (
                <Dato label="Nombre completo">{nombreCompleto(permiso.colaborador)}</Dato>
              ) : null}
            </dl>
          </section>
        </>
      )}
    </main>
  )
}
