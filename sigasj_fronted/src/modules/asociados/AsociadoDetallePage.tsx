import { IconArrowLeft, IconEdit, IconRefresh, IconUser } from '@tabler/icons-react'
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

function Dato({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <dt className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="m-0 break-words font-semibold text-slate-800">{children}</dd>
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
  const success = (location.state as { success?: string } | null)?.success

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
    <main className="grid w-full min-w-0 gap-5 sm:gap-6">
      {success ? <AsociadoFeedback variant="success">{success}</AsociadoFeedback> : null}
      <Link
        to={volverA}
        className="group inline-flex min-h-11 w-fit items-center gap-2.5 rounded-2xl border border-blue-200 bg-white px-4 py-2.5 font-extrabold text-blue-700 no-underline shadow-[0_6px_18px_rgba(37,99,235,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800 hover:no-underline hover:shadow-[0_10px_24px_rgba(37,99,235,0.18)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-600 active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
      >
        <IconArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:transform-none" size={19} aria-hidden="true" />
        Volver a {ASOCIADOS_TITLE}
      </Link>

      {cargando ? (
        <div className="grid gap-4 rounded-2xl border border-sky-100 bg-white p-6 sm:rounded-3xl sm:p-8" role="status">
          <span className="sr-only">Cargando asociado…</span>
          {[0, 1, 2].map((fila) => (
            <div key={fila} className="h-14 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" aria-hidden="true" />
          ))}
        </div>
      ) : error || !asociado ? (
        <div className="grid place-items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center sm:rounded-3xl" role="alert">
          <p className="m-0 font-semibold text-red-800">{error ?? 'No fue posible cargar el asociado.'}</p>
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
              to={volverA}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 font-bold text-slate-700 no-underline hover:no-underline"
            >
              <IconArrowLeft size={18} aria-hidden="true" />
              Volver al listado
            </Link>
          </div>
        </div>
      ) : (
        <>
          <header className="flex flex-col gap-5 rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:p-8">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)]">
                <IconUser size={28} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
                  Asociados · Detalle
                </p>
                <h1 className="m-0 break-words text-2xl font-black tracking-tight text-[#062e63] sm:text-3xl">
                  {nombreCompleto(asociado)}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-slate-500">
                  <span className="font-mono font-semibold">{asociado.cedula}</span>
                  <EstadoAsociadoBadge activo={asociado.activo} />
                </div>
              </div>
            </div>
            <Link
              to={asociadoEditPath(asociado.id)}
              state={{ from: volverA }}
              className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-sky-500 px-6 font-extrabold text-white no-underline shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:text-white hover:no-underline sm:ml-auto sm:w-fit"
            >
              <IconEdit size={19} aria-hidden="true" />
              Editar asociado
            </Link>
          </header>

          <section className="grid gap-5 rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-8">
            <h2 className="m-0 text-lg font-extrabold text-[#073b73]">Información del asociado</h2>
            <dl className="m-0 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <Dato label="Cédula">{asociado.cedula}</Dato>
              <Dato label="Nombre">{asociado.nombre}</Dato>
              <Dato label="Apellidos">{asociado.apellidos}</Dato>
              <Dato label="Correo electrónico">{asociado.correoElectronico}</Dato>
              <Dato label="Estado">{asociado.activo ? 'Activo' : 'Inactivo'}</Dato>
              <Dato label="Fecha de registro">{formatearFecha(asociado.fechaRegistro)}</Dato>
              {asociado.fechaInactivacion ? (
                <Dato label="Fecha de inactivación">{formatearFecha(asociado.fechaInactivacion)}</Dato>
              ) : null}
            </dl>
          </section>
        </>
      )}
    </main>
  )
}
