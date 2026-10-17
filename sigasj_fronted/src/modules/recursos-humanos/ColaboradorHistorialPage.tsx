import {
  IconArrowLeft,
  IconCalendarOff,
  IconChevronLeft,
  IconChevronRight,
  IconFilterOff,
  IconHistory,
  IconRefresh,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { useAuth } from '../auth/components/AuthContext'
import { esNoAutenticado, esReintentable } from './colaboradorForm'
import {
  detalleEventoHistorial,
  etiquetaTipoEvento,
  formatearFechaEvento,
  historialErrorMessage,
  nombreColaboradorHistorial,
} from './historialColaborador'
import {
  HISTORIAL_PAGE_SIZE,
  getHistorialColaborador,
} from './historialColaboradorApi'
import {
  RRHH_PATH,
  RRHH_TITLE,
  colaboradorDetailPath,
} from './recursosHumanosPaths'
import type {
  HistorialColaboradorFiltros,
  HistorialColaboradorRespuesta,
  TipoEventoHistorialRrhh,
} from './types'

const leerFiltros = (params: URLSearchParams): HistorialColaboradorFiltros => {
  const page = Number(params.get('page'))
  const tipo = (params.get('tipo') ?? '') as HistorialColaboradorFiltros['tipo']
  const tiposValidos: Array<TipoEventoHistorialRrhh | ''> = [
    '',
    'PERMISO',
    'VACACION',
    'INCAPACIDAD',
  ]
  return {
    tipo: tiposValidos.includes(tipo) ? tipo : '',
    fechaDesde: params.get('fechaDesde') ?? '',
    fechaHasta: params.get('fechaHasta') ?? '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

const inputClass =
  'min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

const badgeClass = (tipo: TipoEventoHistorialRrhh) => {
  if (tipo === 'PERMISO') {
    return 'border-sky-200 bg-sky-50 text-sky-800'
  }
  if (tipo === 'VACACION') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  }
  return 'border-amber-200 bg-amber-50 text-amber-900'
}

export default function ColaboradorHistorialPage() {
  const { id } = useParams()
  const colaboradorId = Number(id)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const filtros = leerFiltros(searchParams)
  const [respuesta, setRespuesta] = useState<HistorialColaboradorRespuesta | null>(
    null,
  )
  const [resultado, setResultado] = useState<{
    clave: string
    error: string | null
    reintentable: boolean
    status: number | null
  }>({ clave: '', error: null, reintentable: true, status: null })
  const [recarga, setRecarga] = useState(0)

  const idValido = Number.isInteger(colaboradorId) && colaboradorId > 0
  const { tipo, fechaDesde, fechaHasta, page } = filtros
  const clave = JSON.stringify([
    colaboradorId,
    tipo,
    fechaDesde,
    fechaHasta,
    page,
    recarga,
  ])
  const cargando = idValido && resultado.clave !== clave
  const error = !idValido
    ? 'No se encontró el colaborador solicitado.'
    : cargando
      ? null
      : resultado.error
  const es404 = !idValido || resultado.status === 404

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  const actualizarFiltros = useCallback(
    (cambios: Partial<HistorialColaboradorFiltros>) => {
      setSearchParams(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales)
          const resultadoFiltros = {
            ...leerFiltros(actuales),
            page: 1,
            ...cambios,
          }
          const pares: Array<[string, string]> = [
            ['tipo', resultadoFiltros.tipo],
            ['fechaDesde', resultadoFiltros.fechaDesde.trim()],
            ['fechaHasta', resultadoFiltros.fechaHasta.trim()],
            [
              'page',
              resultadoFiltros.page > 1 ? String(resultadoFiltros.page) : '',
            ],
          ]
          pares.forEach(([claveParam, valor]) =>
            valor ? siguientes.set(claveParam, valor) : siguientes.delete(claveParam),
          )
          return siguientes
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  useEffect(() => {
    if (!idValido) return undefined
    const controller = new AbortController()
    getHistorialColaborador(
      colaboradorId,
      { tipo, fechaDesde, fechaHasta, page },
      controller.signal,
    )
      .then((data) => {
        if (controller.signal.aborted) return
        setRespuesta(data)
        setResultado({
          clave,
          error: null,
          reintentable: true,
          status: 200,
        })
        if (data.totalPages > 0 && page > data.totalPages) {
          actualizarFiltros({ page: data.totalPages })
        }
      })
      .catch((err: unknown) => {
        if (
          controller.signal.aborted ||
          (err instanceof DOMException && err.name === 'AbortError') ||
          (err instanceof Error && err.name === 'AbortError')
        ) {
          return
        }
        if (esNoAutenticado(err)) {
          salirPorSesion()
          return
        }
        const statusMatch = /HTTP\s+(\d{3})/i.exec(
          err instanceof Error ? err.message : '',
        )
        setResultado({
          clave,
          error: historialErrorMessage(
            err,
            'No fue posible cargar el historial. Intente nuevamente.',
          ),
          reintentable: esReintentable(err),
          status: statusMatch ? Number(statusMatch[1]) : null,
        })
      })
    return () => controller.abort()
  }, [
    actualizarFiltros,
    clave,
    colaboradorId,
    fechaDesde,
    fechaHasta,
    idValido,
    page,
    salirPorSesion,
    tipo,
  ])

  const hayFiltros = Boolean(tipo || fechaDesde || fechaHasta)
  const limpiarFiltros = () => {
    actualizarFiltros({
      tipo: '',
      fechaDesde: '',
      fechaHasta: '',
      page: 1,
    })
  }

  const eventos = respuesta?.historial ?? []
  const total = respuesta?.total ?? 0
  const totalPages = respuesta?.totalPages ?? 0
  const colaborador = respuesta?.colaborador ?? null
  const desde = total ? (page - 1) * HISTORIAL_PAGE_SIZE + 1 : 0
  const hasta = Math.min(page * HISTORIAL_PAGE_SIZE, total)

  return (
    <main className="grid w-full min-w-0 gap-5 sm:gap-6">
      <Link
        to={idValido ? colaboradorDetailPath(colaboradorId) : RRHH_PATH}
        className="inline-flex w-fit items-center gap-2 font-bold text-blue-700 no-underline hover:underline"
      >
        <IconArrowLeft size={18} aria-hidden="true" />
        {idValido ? 'Volver al colaborador' : `Volver a ${RRHH_TITLE}`}
      </Link>

      {cargando && !respuesta ? (
        <div
          className="grid gap-4 rounded-2xl border border-sky-100 bg-white p-6 sm:rounded-3xl sm:p-8"
          role="status"
        >
          <span className="sr-only">Cargando historial…</span>
          {[0, 1, 2, 3].map((fila) => (
            <div
              key={fila}
              className="h-14 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : error ? (
        <div
          className="grid place-items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center sm:rounded-3xl"
          role="alert"
        >
          <p className="m-0 font-semibold text-red-800">{error}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {idValido && resultado.reintentable && !es404 ? (
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
              Volver a colaboradores
            </Link>
          </div>
        </div>
      ) : (
        <>
          <header className="flex flex-col gap-5 rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)]">
                <IconHistory size={28} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
                  {RRHH_TITLE} · Historial
                </p>
                <h1 className="m-0 break-words text-2xl font-black tracking-tight text-[#062e63] sm:text-3xl">
                  Historial administrativo
                </h1>
                {colaborador ? (
                  <p className="mt-2 m-0 font-semibold text-slate-600">
                    {nombreColaboradorHistorial(colaborador)}
                    <span className="font-normal text-slate-500">
                      {' '}
                      · {colaborador.cargo}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
          </header>

          <section
            className="grid gap-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-6 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end"
            aria-label="Filtros del historial"
          >
            <label className="grid min-w-0 gap-2">
              <span className="text-sm font-bold text-[#163f6b]">Tipo</span>
              <select
                className={inputClass}
                value={tipo}
                onChange={(event) =>
                  actualizarFiltros({
                    tipo: event.target.value as HistorialColaboradorFiltros['tipo'],
                  })
                }
              >
                <option value="">Todos</option>
                <option value="PERMISO">Permiso</option>
                <option value="VACACION">Vacaciones</option>
                <option value="INCAPACIDAD">Incapacidad</option>
              </select>
            </label>
            <label className="grid min-w-0 gap-2">
              <span className="text-sm font-bold text-[#163f6b]">Desde</span>
              <input
                type="date"
                className={inputClass}
                value={fechaDesde}
                onChange={(event) =>
                  actualizarFiltros({ fechaDesde: event.target.value })
                }
              />
            </label>
            <label className="grid min-w-0 gap-2">
              <span className="text-sm font-bold text-[#163f6b]">Hasta</span>
              <input
                type="date"
                className={inputClass}
                value={fechaHasta}
                onChange={(event) =>
                  actualizarFiltros({ fechaHasta: event.target.value })
                }
              />
            </label>
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2 xl:col-span-1"
              onClick={limpiarFiltros}
              disabled={!hayFiltros}
            >
              <IconFilterOff size={18} aria-hidden="true" />
              Limpiar filtros
            </button>
          </section>

          <section
            className="min-w-0 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl"
            aria-busy={cargando}
            aria-label="Historial administrativo"
          >
            {cargando && !eventos.length ? (
              <div className="grid gap-3 p-6" role="status">
                <span className="sr-only">Cargando historial…</span>
                {[0, 1, 2].map((fila) => (
                  <div
                    key={fila}
                    className="h-14 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : eventos.length === 0 ? (
              <div className="grid place-items-center gap-3 p-10 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                  <IconCalendarOff size={28} aria-hidden="true" />
                </span>
                <h2 className="m-0 text-lg font-extrabold text-[#073b73]">
                  {hayFiltros
                    ? 'No se encontraron eventos con los filtros seleccionados.'
                    : 'No hay eventos administrativos registrados para este colaborador.'}
                </h2>
              </div>
            ) : (
              <table
                className={`w-full border-collapse text-left transition-opacity ${cargando ? 'opacity-60' : ''}`}
              >
                <thead className="hidden bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-500 xl:table-header-group">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Detalle
                    </th>
                  </tr>
                </thead>
                <tbody className="block divide-y divide-slate-100 xl:table-row-group">
                  {eventos.map((evento) => (
                    <tr
                      key={`${evento.tipo}-${evento.id}`}
                      className="grid gap-2 px-5 py-4 transition hover:bg-sky-50/50 xl:table-row xl:p-0"
                    >
                      <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                        <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">
                          Fecha
                        </span>
                        <span className="font-semibold text-slate-700">
                          {formatearFechaEvento(evento.fecha)}
                        </span>
                      </td>
                      <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                        <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">
                          Tipo
                        </span>
                        <span
                          className={`inline-flex rounded-lg border px-2.5 py-1 text-sm font-bold ${badgeClass(evento.tipo)}`}
                        >
                          {etiquetaTipoEvento(evento.tipo)}
                        </span>
                      </td>
                      <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                        <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">
                          Detalle
                        </span>
                        <span className="min-w-0 text-right font-semibold text-slate-700 xl:text-left">
                          {detalleEventoHistorial(evento)}
                          {evento.tipo !== 'VACACION' &&
                          evento.fechaInicio &&
                          evento.fechaFin &&
                          evento.fechaInicio !== evento.fechaFin ? (
                            <span className="mt-1 block text-sm font-normal text-slate-500">
                              {formatearFechaEvento(evento.fechaInicio)} —{' '}
                              {formatearFechaEvento(evento.fechaFin)}
                            </span>
                          ) : null}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!error && total > 0 ? (
              <nav
                className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:px-6"
                aria-label="Paginación del historial"
              >
                <p className="m-0">
                  Mostrando {desde}–{hasta} de {total} evento
                  {total === 1 ? '' : 's'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => actualizarFiltros({ page: page - 1 })}
                    disabled={page <= 1 || cargando}
                  >
                    <IconChevronLeft size={17} aria-hidden="true" />
                    Anterior
                  </button>
                  <span className="px-2 font-semibold text-slate-600">
                    Página {page} de {Math.max(totalPages, 1)}
                  </span>
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => actualizarFiltros({ page: page + 1 })}
                    disabled={page >= totalPages || cargando}
                  >
                    Siguiente
                    <IconChevronRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </nav>
            ) : null}
          </section>
        </>
      )}
    </main>
  )
}
