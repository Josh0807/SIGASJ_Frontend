import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { IconPrinter } from '@tabler/icons-react'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'
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

  useEffect(() => {
    setDraftDesde(fechaDesde)
    setDraftHasta(fechaHasta)
  }, [fechaDesde, fechaHasta])

  const rangoInvalido = Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta)

  useEffect(() => {
    if (rangoInvalido) {
      setAverias([])
      setLoading(false)
      setError('La fecha inicial no puede ser posterior a la fecha final.')
      return
    }

    let cancelled = false
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
    return () => {
      cancelled = true
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
    <main className="gallery-admin averias-admin inventario-print w-full min-w-0">
      <div className="gallery-admin__shell sigasj-stack">
        <header className="gallery-admin__header inventario-print__controls !rounded-[28px] !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/70 !px-8 !py-8 !shadow-[0_14px_38px_rgba(30,90,156,0.10)] md:!px-10">
          <div className="space-y-3">
            <p className="gallery-admin__eyebrow !m-0 !text-sm !font-black !tracking-[0.12em] !text-blue-600">Panel administrativo</p>
            <h1>Imprimir averías atendidas</h1>
            <p>Listado de averías en proceso y reparadas para el archivo de la ASADA.</p>
          </div>
          <div className="gallery-admin__header-actions">
            <Link className="gallery-admin__button !rounded-2xl !border-blue-200 !bg-white !px-6 !py-3.5 !font-bold !text-blue-700 !no-underline !shadow-md" to={AVERIAS_ADMIN_REPORTE_PATH}>
              Volver al resumen
            </Link>
          </div>
        </header>

        <form
          className="gallery-admin__filters inventario-print__controls w-full !rounded-[28px] !border-blue-100 !bg-white/90 !p-7 !shadow-[0_14px_38px_rgba(30,90,156,0.08)]"
          aria-label="Rango del reporte"
          onSubmit={aplicarRango}
        >
          <div className="col-span-full border-b border-blue-100 pb-5">
            <p className="mb-1 text-sm font-black uppercase tracking-[0.12em] text-blue-600">Preparar reporte</p>
            <h2 className="m-0 text-2xl font-black tracking-tight text-[#07376f]">Seleccione el periodo</h2>
            <p className="mt-2 text-base text-slate-500">Consulte las averías atendidas antes de imprimir.</p>
          </div>
          <label className="gallery-admin__field" htmlFor="averias-imprimir-desde">
            <span>Desde</span>
            <input
              id="averias-imprimir-desde"
              name="fechaDesde"
              type="date"
              value={draftDesde}
              onChange={(event) => setDraftDesde(event.target.value)}
            />
          </label>
          <label className="gallery-admin__field" htmlFor="averias-imprimir-hasta">
            <span>Hasta</span>
            <input
              id="averias-imprimir-hasta"
              name="fechaHasta"
              type="date"
              value={draftHasta}
              onChange={(event) => setDraftHasta(event.target.value)}
            />
          </label>
          <button className="gallery-admin__button !rounded-2xl !border-0 !bg-gradient-to-r !from-blue-600 !to-sky-500 !font-bold !text-white !shadow-lg !shadow-blue-200" type="submit" disabled={loading}>
            Consultar
          </button>
          <button
            className="gallery-admin__button inventario-print__action !rounded-2xl !border-blue-200 !bg-white !font-bold !text-blue-700 !shadow-md"
            type="button"
            onClick={imprimir}
            disabled={loading || Boolean(error) || averias.length === 0}
          >
            <IconPrinter size={18} aria-hidden="true" />
            Imprimir
          </button>
        </form>

        {error ? (
          <div className="gallery-admin__empty inventario-print__controls" role="alert">
            <p>{error}</p>
          </div>
        ) : null}

        {loading ? (
          <p className="gallery-admin__empty inventario-print__controls" role="status">
            Cargando averías atendidas…
          </p>
        ) : null}

        {!loading && !error ? (
          <article className="inventario-print__sheet !rounded-[28px] !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/40 !p-7 !shadow-[0_16px_40px_rgba(30,90,156,0.10)] md:!p-9">
            <header className="inventario-print__letterhead !gap-5 !border-blue-100 !pb-6">
              <img className="!h-16 !w-16 !rounded-2xl !border !border-blue-100 !bg-white !p-2 !object-contain !shadow-md" src={asadaLogo} alt="ASADA San Juan" />
              <div>
                <p className="!mb-1 !text-sm !font-black !uppercase !tracking-[0.12em] !text-blue-600">ASADA San Juan</p>
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
              <div className="inventario-print__empty rounded-3xl border border-dashed border-blue-200 bg-white/80 px-6 py-10 text-center shadow-inner">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600" aria-hidden="true">i</span>
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
      </div>
    </main>
  )
}
