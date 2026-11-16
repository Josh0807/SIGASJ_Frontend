import {
  IconArrowLeft,
  IconCalendarOff,
  IconChevronLeft,
  IconChevronRight,
  IconFilterOff,
  IconRefresh,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import {
  AdminFilterField,
  AdminFilters,
  AdminShell,
  Button,
  PageHeader,
  adminFilterControlClassName,
  adminFilterSelectClassName,
} from '../../shared/ui'
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

const badgeClass = (tipo: TipoEventoHistorialRrhh) => {
  if (tipo === 'PERMISO') {
    return 'border-[#bfe3fa] bg-sky-50 text-sky-800'
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

  const volverA = idValido ? colaboradorDetailPath(colaboradorId) : RRHH_PATH

  return (
    <AdminShell className="gap-5 sm:gap-6" aria-labelledby="colaborador-historial-title">
      <PageHeader
        id="colaborador-historial-title"
        eyebrow={`${RRHH_TITLE} · Historial`}
        title="Historial administrativo"
        description={
          colaborador ? (
            <>
              {nombreColaboradorHistorial(colaborador)}
              <span className="font-normal text-sigasj-muted"> · {colaborador.cargo}</span>
            </>
          ) : (
            'Eventos de permisos, vacaciones e incapacidades del colaborador.'
          )
        }
        actions={
          <Button
            to={volverA}
            variant="secondary"
            size="sm"
            leftIcon={<IconArrowLeft size={16} aria-hidden="true" />}
          >
            {idValido ? 'Volver al colaborador' : `Volver a ${RRHH_TITLE}`}
          </Button>
        }
      />

      {cargando && !respuesta ? (
        <div
          className="grid gap-4 rounded-2xl border border-[#d7e5f1] bg-white p-6 sm:rounded-3xl sm:p-8"
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
              <Button
                type="button"
                variant="secondary"
                leftIcon={<IconRefresh size={18} aria-hidden="true" />}
                onClick={() => setRecarga((n) => n + 1)}
              >
                Reintentar
              </Button>
            ) : null}
            <Button
              to={RRHH_PATH}
              variant="secondary"
              leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
            >
              Volver a colaboradores
            </Button>
          </div>
        </div>
      ) : (
        <>
          <AdminFilters
            aria-label="Filtros del historial"
            summary={
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<IconFilterOff size={16} aria-hidden="true" />}
                  onClick={limpiarFiltros}
                  disabled={!hayFiltros}
                >
                  Limpiar filtros
                </Button>
                <span className="whitespace-nowrap text-sm font-semibold text-sigasj-muted">
                  <strong className="text-sigasj-ink">{cargando ? '…' : total}</strong>{' '}
                  evento{total === 1 ? '' : 's'}
                </span>
              </>
            }
          >
            <AdminFilterField label="Tipo">
              <select
                className={adminFilterSelectClassName}
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
            </AdminFilterField>
            <AdminFilterField label="Desde">
              <input
                type="date"
                className={adminFilterControlClassName}
                value={fechaDesde}
                onChange={(event) =>
                  actualizarFiltros({ fechaDesde: event.target.value })
                }
              />
            </AdminFilterField>
            <AdminFilterField label="Hasta">
              <input
                type="date"
                className={adminFilterControlClassName}
                value={fechaHasta}
                onChange={(event) =>
                  actualizarFiltros({ fechaHasta: event.target.value })
                }
              />
            </AdminFilterField>
          </AdminFilters>

          <section
            className="min-w-0 overflow-hidden rounded-2xl border border-[#d7e5f1] bg-white shadow-[0_12px_30px_rgba(30, 90, 156,0.07)] sm:rounded-3xl"
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
                <span className="grid size-14 place-items-center rounded-2xl bg-[#eaf6ff] text-[#1e5a9c]">
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
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<IconChevronLeft size={16} aria-hidden="true" />}
                    onClick={() => actualizarFiltros({ page: page - 1 })}
                    disabled={page <= 1 || cargando}
                  >
                    Anterior
                  </Button>
                  <span className="px-2 font-semibold text-slate-600">
                    Página {page} de {Math.max(totalPages, 1)}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    rightIcon={<IconChevronRight size={16} aria-hidden="true" />}
                    onClick={() => actualizarFiltros({ page: page + 1 })}
                    disabled={page >= totalPages || cargando}
                  >
                    Siguiente
                  </Button>
                </div>
              </nav>
            ) : null}
          </section>
        </>
      )}
    </AdminShell>
  )
}
