import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconSparkles,
} from '@tabler/icons-react'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { feriadosDelAnio } from './feriadosCostaRica'

const PANEL_WIDTH = 344
const PANEL_GAP = 8
/** Altura aproximada del calendario (cabecera + grilla + pie). */
const PANEL_HEIGHT_EST = 390

type Props = {
  label: string
  value: string
  onChange: (iso: string) => void
  error?: string
  required?: boolean
  min?: string
  max?: string
}

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Setiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const isoFromParts = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

const parseIso = (iso: string): { y: number; m: number; d: number } | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d }
}

const formatearVisible = (iso: string) => {
  const p = parseIso(iso)
  if (!p) return ''
  return `${String(p.d).padStart(2, '0')}/${String(p.m).padStart(2, '0')}/${p.y}`
}

const hoyIso = () => {
  const n = new Date()
  return isoFromParts(n.getFullYear(), n.getMonth() + 1, n.getDate())
}

const primerLunesOffset = (y: number, m: number) => {
  const dow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay()
  return (dow + 6) % 7
}

const diasEnMes = (y: number, m: number) =>
  new Date(Date.UTC(y, m, 0)).getUTCDate()

/**
 * Selector de fecha con calendario propio: marca feriados nacionales de CR.
 */
export default function FechaFeriadoPicker({
  label,
  value,
  onChange,
  error,
  required,
  min,
  max,
}: Props) {
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [abierto, setAbierto] = useState(false)
  const [hoverFeriado, setHoverFeriado] = useState<string | null>(null)
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({})

  const inicial = parseIso(value) ?? {
    y: new Date().getFullYear(),
    m: new Date().getMonth() + 1,
    d: 1,
  }
  const [vistaY, setVistaY] = useState(inicial.y)
  const [vistaM, setVistaM] = useState(inicial.m)

  useEffect(() => {
    if (!abierto) return
    const p = parseIso(value)
    if (p) {
      setVistaY(p.y)
      setVistaM(p.m)
    }
  }, [abierto, value])

  const posicionarPanel = () => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const width = Math.min(PANEL_WIDTH, vw - 16)

    let left = rect.left
    if (left + width > vw - 8) left = Math.max(8, vw - width - 8)
    if (left < 8) left = 8

    const espacioAbajo = Math.max(200, vh - rect.bottom - PANEL_GAP - 8)
    setPanelStyle({
      position: 'fixed',
      left,
      top: rect.bottom + PANEL_GAP,
      bottom: 'auto',
      width,
      zIndex: 80,
      maxHeight: Math.min(PANEL_HEIGHT_EST + 48, espacioAbajo),
    })
  }

  useLayoutEffect(() => {
    if (!abierto) return undefined
    posicionarPanel()
    const onReposition = () => posicionarPanel()
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [abierto])

  useEffect(() => {
    if (!abierto) return undefined
    setHoverFeriado(null)
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        rootRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return
      }
      setAbierto(false)
    }
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [abierto])

  const mapaFeriados = useMemo(() => {
    const map = new Map<string, string>()
    for (const f of feriadosDelAnio(vistaY)) map.set(f.fecha, f.nombre)
    for (const f of feriadosDelAnio(vistaY - 1)) map.set(f.fecha, f.nombre)
    for (const f of feriadosDelAnio(vistaY + 1)) map.set(f.fecha, f.nombre)
    return map
  }, [vistaY])

  const feriadosDelMes = useMemo(() => {
    const prefijo = `${vistaY}-${String(vistaM).padStart(2, '0')}-`
    return [...mapaFeriados.entries()]
      .filter(([fecha]) => fecha.startsWith(prefijo))
      .map(([fecha, nombre]) => ({ fecha, nombre, dia: Number(fecha.slice(8)) }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
  }, [mapaFeriados, vistaY, vistaM])

  const celdas = useMemo(() => {
    const offset = primerLunesOffset(vistaY, vistaM)
    const total = diasEnMes(vistaY, vistaM)
    const items: Array<{
      iso: string
      dia: number
      fueraMes: boolean
      feriado: string | null
    }> = []

    const pushDia = (y: number, m: number, d: number, fueraMes: boolean) => {
      const fecha = isoFromParts(y, m, d)
      items.push({
        iso: fecha,
        dia: d,
        fueraMes,
        feriado: mapaFeriados.get(fecha) ?? null,
      })
    }

    const prevM = vistaM === 1 ? 12 : vistaM - 1
    const prevY = vistaM === 1 ? vistaY - 1 : vistaY
    const prevTotal = diasEnMes(prevY, prevM)
    for (let i = offset; i > 0; i -= 1) {
      pushDia(prevY, prevM, prevTotal - i + 1, true)
    }
    for (let d = 1; d <= total; d += 1) {
      pushDia(vistaY, vistaM, d, false)
    }
    const nextM = vistaM === 12 ? 1 : vistaM + 1
    const nextY = vistaM === 12 ? vistaY + 1 : vistaY
    let nextDia = 1
    while (items.length % 7 !== 0) {
      pushDia(nextY, nextM, nextDia, true)
      nextDia += 1
    }
    return items
  }, [vistaY, vistaM, mapaFeriados])

  const mesAnterior = () => {
    if (vistaM === 1) {
      setVistaM(12)
      setVistaY((y) => y - 1)
    } else setVistaM((m) => m - 1)
  }

  const mesSiguiente = () => {
    if (vistaM === 12) {
      setVistaM(1)
      setVistaY((y) => y + 1)
    } else setVistaM((m) => m + 1)
  }

  const seleccionar = (iso: string, fueraMes: boolean) => {
    if (min && iso < min) return
    if (max && iso > max) return
    onChange(iso)
    setAbierto(false)
    if (fueraMes) {
      const p = parseIso(iso)
      if (p) {
        setVistaY(p.y)
        setVistaM(p.m)
      }
    }
  }

  const onTriggerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setAbierto((v) => !v)
    }
  }

  const visible = formatearVisible(value)
  const hoy = hoyIso()
  const tipFeriado =
    hoverFeriado ||
    (value && mapaFeriados.get(value) ? mapaFeriados.get(value)! : null)

  return (
    <div className="relative grid min-w-0 gap-2.5" ref={rootRef}>
      <span className="text-sm font-bold text-[#163f6b]">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <button
        ref={triggerRef}
        type="button"
        className={`group flex min-h-14 w-full items-center gap-3 rounded-xl border bg-white px-4 text-left transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-5 ${
          error
            ? 'border-red-400'
            : abierto
              ? 'border-blue-500 ring-2 ring-blue-100'
              : 'border-slate-200 hover:border-blue-300'
        }`}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-controls={panelId}
        aria-invalid={Boolean(error)}
        onClick={() => setAbierto((v) => !v)}
        onKeyDown={onTriggerKey}
      >
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-full transition ${
            error
              ? 'bg-red-50 text-red-500'
              : abierto
                ? 'bg-[#062e63] text-white'
                : 'bg-sky-50 text-blue-700 group-hover:bg-sky-100'
          }`}
        >
          <IconCalendarEvent size={18} aria-hidden="true" />
        </span>
        <span
          className={`min-w-0 flex-1 py-3 font-semibold tracking-wide ${
            visible ? 'text-slate-800' : 'text-slate-400'
          }`}
        >
          {visible || 'dd / mm / aaaa'}
        </span>
        {value && mapaFeriados.get(value) ? (
          <span className="hidden shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-amber-900 sm:inline-flex">
            Feriado
          </span>
        ) : null}
      </button>

      {abierto && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label={`Calendario: ${label}`}
              style={panelStyle}
              className="overflow-y-auto overscroll-contain rounded-[1.35rem] border border-slate-200/80 bg-white shadow-[0_24px_50px_-12px_rgba(6,46,99,0.28)] animate-[feriadoPop_180ms_cubic-bezier(0.22,1,0.36,1)]"
            >
              <style>{`
            @keyframes feriadoPop {
              from { opacity: 0; transform: translateY(-8px) scale(0.97); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

              <header className="flex items-center justify-between gap-2 bg-[#062e63] px-4 py-3.5 text-white">
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full border-0 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Mes anterior"
              onClick={mesAnterior}
            >
              <IconChevronLeft size={18} aria-hidden="true" />
            </button>
            <div className="text-center">
              <p className="m-0 text-[1.05rem] font-black leading-tight tracking-tight">
                {MESES[vistaM - 1]}
              </p>
              <p className="m-0 text-[0.7rem] font-semibold tracking-[0.18em] text-sky-200/90">
                {vistaY}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full border-0 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Mes siguiente"
              onClick={mesSiguiente}
            >
              <IconChevronRight size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="bg-[#f7fafc] px-3 pb-3.5 pt-3">
            <div className="mb-1.5 grid grid-cols-7 text-center text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-400">
              {DIAS_SEMANA.map((d) => (
                <span key={d} className="py-1.5">
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {celdas.map((celda) => {
                const seleccionado = celda.iso === value
                const esHoy = celda.iso === hoy && !celda.fueraMes
                const fueraRango =
                  (min != null && celda.iso < min) ||
                  (max != null && celda.iso > max)
                const esFeriado = Boolean(celda.feriado) && !celda.fueraMes

                return (
                  <button
                    key={celda.iso + String(celda.fueraMes)}
                    type="button"
                    disabled={fueraRango}
                    title={
                      celda.feriado
                        ? `Feriado: ${celda.feriado}`
                        : formatearVisible(celda.iso)
                    }
                    aria-label={
                      celda.feriado
                        ? `${formatearVisible(celda.iso)}, feriado ${celda.feriado}`
                        : formatearVisible(celda.iso)
                    }
                    aria-pressed={seleccionado}
                    onMouseEnter={() =>
                      setHoverFeriado(
                        celda.fueraMes ? null : (celda.feriado ?? null),
                      )
                    }
                    onMouseLeave={() => setHoverFeriado(null)}
                    onFocus={() =>
                      setHoverFeriado(
                        celda.fueraMes ? null : (celda.feriado ?? null),
                      )
                    }
                    onBlur={() => setHoverFeriado(null)}
                    onClick={() => seleccionar(celda.iso, celda.fueraMes)}
                    className={[
                      'mx-auto flex size-9 items-center justify-center rounded-full border-0 text-[0.8125rem] font-semibold transition duration-150',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
                      fueraRango ? 'cursor-not-allowed opacity-30' : '',
                      celda.fueraMes && !seleccionado
                        ? 'bg-transparent text-slate-300'
                        : '',
                      !celda.fueraMes &&
                      !seleccionado &&
                      !esFeriado &&
                      !fueraRango
                        ? 'bg-transparent text-slate-700 hover:bg-white hover:text-[#062e63] hover:shadow-sm'
                        : '',
                      esHoy && !seleccionado && !esFeriado
                        ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200'
                        : '',
                      esFeriado && !seleccionado && !fueraRango
                        ? 'bg-amber-400 text-amber-950 shadow-[0_4px_10px_rgba(245,158,11,0.35)] hover:bg-amber-300'
                        : '',
                      seleccionado && !esFeriado
                        ? 'bg-[#062e63] text-white shadow-[0_6px_14px_rgba(6,46,99,0.35)]'
                        : '',
                      seleccionado && esFeriado
                        ? 'bg-amber-500 text-white shadow-[0_6px_14px_rgba(245,158,11,0.45)] ring-2 ring-amber-200'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {celda.dia}
                  </button>
                )
              })}
            </div>

            <div className="mt-3 rounded-2xl bg-white px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]">
              {tipFeriado ? (
                <p className="m-0 flex items-start gap-2 text-xs leading-5 text-amber-950">
                  <IconSparkles
                    className="mt-0.5 shrink-0 text-amber-500"
                    size={14}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="font-extrabold">Feriado · </span>
                    {tipFeriado}
                  </span>
                </p>
              ) : feriadosDelMes.length > 0 ? (
                <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {feriadosDelMes.map((f) => (
                    <li key={f.fecha}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full border-0 bg-amber-50 px-2.5 py-1 text-[0.7rem] font-bold text-amber-950 transition hover:bg-amber-100"
                        title={f.nombre}
                        onClick={() => seleccionar(f.fecha, false)}
                      >
                        <span className="grid size-5 place-items-center rounded-full bg-amber-400 text-[0.65rem] font-black text-amber-950">
                          {f.dia}
                        </span>
                        <span className="max-w-[9rem] truncate">{f.nombre}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-amber-400" />
                    Feriado
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-white ring-1 ring-blue-300" />
                    Hoy
                  </span>
                  <span className="text-slate-400">Sin feriados este mes</span>
                </p>
              )}
            </div>
          </div>
            </div>,
            document.body,
          )
        : null}

      {error ? (
        <small className="font-semibold text-red-600" role="alert">
          {error}
        </small>
      ) : null}
    </div>
  )
}
