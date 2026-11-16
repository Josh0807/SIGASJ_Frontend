import { ZONA_HORARIA_ASADA } from '../../../shared/utils/fechaAsada'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import { useSearchParams } from 'react-router-dom'
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'
import {
  AdminFilterField,
  AdminFilters,
  AdminShell,
  Button,
  EmptyState,
  PageHeader,
  adminFilterControlClassName,
} from '../../../shared/ui'
import { getAveriasAtendidasParaImpresion } from '../services/averiasAdminApi'
import { ESTADO_AVERIA_LABELS, isEstadoAveria } from './estadoAveria'
import { formatAveriaAdminDateTime } from './formatAveriaAdminDate'
import { AVERIAS_ADMIN_REPORTE_PATH } from './averiasAdminPaths'
import {
  getPrioridadLabel,
  getTipoAveriaDetailLabel,
  type AveriaHistorialItem,
} from './types'

const formatPrintDate = (value: Date) =>
  value.toLocaleString('es-CR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: ZONA_HORARIA_ASADA,
  })

const etiquetaEstado = (estado: string) =>
  isEstadoAveria(estado) ? ESTADO_AVERIA_LABELS[estado] : estado

const ordenAtencion = (item: AveriaHistorialItem) =>
  item.estado === 'EN_ATENCION' ? 0 : item.estado === 'RESUELTA' ? 1 : 2

export default function ImprimirAveriasAtendidasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const fechaDesde = searchParams.get('fechaDesde') ?? ''
  const fechaHasta = searchParams.get('fechaHasta') ?? ''
  const [draftDesde, setDraftDesde] = useState(fechaDesde)
  const [draftHasta, setDraftHasta] = useState(fechaHasta)
  const [averias, setAverias] = useState<AveriaHistorialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [printedAt, setPrintedAt] = useState(() => new Date())

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Averías atendidas — ASADA San Juan'
    return () => {
      document.title = previousTitle
    }
  }, [])

  const [fechaDesdeSource, setFechaDesdeSource] = useState(fechaDesde)
  const [fechaHastaSource, setFechaHastaSource] = useState(fechaHasta)
  if (fechaDesde !== fechaDesdeSource || fechaHasta !== fechaHastaSource) {
    setFechaDesdeSource(fechaDesde)
    setFechaHastaSource(fechaHasta)
    setDraftDesde(fechaDesde)
    setDraftHasta(fechaHasta)
  }

  const rangoInvalido = Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta)

  useEffect(() => {
    let cancelled = false
    const cancelScheduled = runAfterEffect(() => {
      if (rangoInvalido) {
        setAverias([])
        setLoading(false)
        setError('La fecha inicial no puede ser posterior a la fecha final.')
        return
      }

      setLoading(true)
      setError('')
      getAveriasAtendidasParaImpresion({
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      })
        .then((data) => {
          if (cancelled) return
          setAverias(
            [...data].sort((izquierda, derecha) => {
              const porEstado = ordenAtencion(izquierda) - ordenAtencion(derecha)
              if (porEstado !== 0) return porEstado
              return derecha.fechaReporte.localeCompare(izquierda.fechaReporte)
            }),
          )
        })
        .catch(() => {
          if (cancelled) return
          setAverias([])
          setError('No fue posible cargar las averías atendidas. Intente nuevamente.')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    })
    return () => {
      cancelled = true
      cancelScheduled()
    }
  }, [fechaDesde, fechaHasta, rangoInvalido])

  const enProceso = useMemo(
    () => averias.filter((item) => item.estado === 'EN_ATENCION').length,
    [averias],
  )
  const reparadas = useMemo(
    () => averias.filter((item) => item.estado === 'RESUELTA').length,
    [averias],
  )

  const aplicarRango = (event: FormEvent) => {
    event.preventDefault()
    const next = new URLSearchParams()
    if (draftDesde) next.set('fechaDesde', draftDesde)
    if (draftHasta) next.set('fechaHasta', draftHasta)
    setSearchParams(next, { replace: true })
  }

  const imprimir = () => {
    setPrintedAt(new Date())
    window.setTimeout(() => window.print(), 0)
  }

  return (
    <AdminShell
      className="averias-admin inventario-print w-full min-w-0 gap-5 sm:gap-6"
      aria-labelledby="averias-imprimir-atendidas-title"
    >
      <PageHeader
        id="averias-imprimir-atendidas-title"
        className="inventario-print__controls"
        eyebrow="Operación · Averías"
        title="Imprimir averías atendidas"
        description="Listado de averías en proceso y reparadas para el archivo de la ASADA."
        actions={
          <Button
            to={AVERIAS_ADMIN_REPORTE_PATH}
            variant="secondary"
            size="sm"
            leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
          >
            Volver al resumen
          </Button>
        }
      />

      <AdminFilters
        className="inventario-print__controls"
        aria-label="Rango del reporte"
        summary={
          <>
            <Button
              type="button"
              size="sm"
              disabled={loading}
              onClick={(event) => aplicarRango(event as unknown as FormEvent)}
            >
              Consultar
            </Button>
            <Button
              type="button"
              size="sm"
              className="inventario-print__action"
              leftIcon={<IconPrinter size={18} aria-hidden="true" />}
              onClick={imprimir}
              disabled={loading || Boolean(error) || averias.length === 0}
            >
              Imprimir
            </Button>
          </>
        }
      >
        <AdminFilterField label="Desde">
          <input
            id="averias-imprimir-desde"
            name="fechaDesde"
            type="date"
            className={adminFilterControlClassName}
            value={draftDesde}
            onChange={(event) => setDraftDesde(event.target.value)}
          />
        </AdminFilterField>
        <AdminFilterField label="Hasta">
          <input
            id="averias-imprimir-hasta"
            name="fechaHasta"
            type="date"
            className={adminFilterControlClassName}
            value={draftHasta}
            onChange={(event) => setDraftHasta(event.target.value)}
          />
        </AdminFilterField>
      </AdminFilters>

      {error ? (
        <EmptyState
          className="inventario-print__controls"
          role="alert"
          title={error}
        />
      ) : null}

      {loading ? (
        <EmptyState
          className="inventario-print__controls"
          role="status"
          title="Cargando averías atendidas…"
        />
      ) : null}

      {!loading && !error ? (
          <article className="inventario-print__sheet !rounded-[28px] !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/40 !p-7 !shadow-[0_16px_40px_rgba(30, 90, 156,0.10)] md:!p-9">
            <header className="inventario-print__letterhead !gap-5 !border-blue-100 !pb-6">
              <img className="!h-16 !w-16 !rounded-2xl !border !border-blue-100 !bg-white !p-2 !object-contain !shadow-md" src={asadaLogo} alt="ASADA San Juan" />
              <div>
                <p className="!mb-1 !text-sm !font-black !uppercase !tracking-[0.12em] !text-[#1e5a9c]">ASADA San Juan</p>
                <h2>Reporte de averías atendidas</h2>
              </div>
            </header>
            <p className="inventario-print__meta !my-6 !rounded-2xl !border !border-blue-100 !bg-white !px-5 !py-4 !font-semibold !leading-relaxed !text-slate-600 !shadow-sm">
              Impreso el {formatPrintDate(printedAt)}. En proceso: {enProceso}. Reparadas:{' '}
              {reparadas}.
              {fechaDesde || fechaHasta
                ? ` Periodo: ${fechaDesde || '…'} a ${fechaHasta || '…'}.`
                : ' Periodo: todas las fechas.'}
            </p>
            {averias.length === 0 ? (
              <div className="inventario-print__empty rounded-3xl border border-dashed border-[#bfe3fa] bg-white/80 px-6 py-10 text-center shadow-inner">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf6ff] text-2xl text-[#1e5a9c]" aria-hidden="true">i</span>
                <h3 className="m-0 text-lg font-black text-[#07376f]">Sin averías atendidas</h3>
                <p className="mb-0 mt-2 text-base font-medium text-slate-500">No hay averías en proceso ni reparadas en el periodo consultado.</p>
              </div>
            ) : (
              <div className="inventario-print__table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Tipo</th>
                      <th>Sector</th>
                      <th>Fontanero</th>
                      <th>Inicio</th>
                      <th>Resolución</th>
                    </tr>
                  </thead>
                  <tbody>
                    {averias.map((item) => (
                      <tr key={item.id}>
                        <td>{item.codigoSeguimiento}</td>
                        <td>{etiquetaEstado(String(item.estado))}</td>
                        <td>{getPrioridadLabel(item.prioridad)}</td>
                        <td>{getTipoAveriaDetailLabel(item.tipoAveria)}</td>
                        <td>{item.sectorComunidad}</td>
                        <td>{item.fontanero?.nombre || 'Sin asignar'}</td>
                        <td>{formatAveriaAdminDateTime(item.fechaInicioAtencion)}</td>
                        <td>{formatAveriaAdminDateTime(item.fechaResolucion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ) : null}
    </AdminShell>
  )
}
