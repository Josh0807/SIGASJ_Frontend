import {
  IconAdjustmentsHorizontal,
  IconBeach,
  IconBriefcase,
  IconId,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'
import EstadoBadge from './EstadoBadge'
import { nombreCompleto } from './colaboradorForm'
import type { BalanceVacaciones } from './types'

function MetricQuiet({
  label,
  dias,
  icon,
  tono,
}: {
  label: string
  dias: number
  icon: ReactNode
  tono: 'adquiridas' | 'disfrutadas' | 'ajustes'
}) {
  const mostrar = Number.isFinite(dias) ? dias : 0
  const tonos = {
    adquiridas: 'border-sky-200/80 bg-sky-50/80 text-sky-950',
    disfrutadas: 'border-amber-200/80 bg-amber-50/70 text-amber-950',
    ajustes:
      'border-[color:var(--asada-line,#d7e5f1)] bg-[color:var(--asada-ice,#eaf6ff)] text-[color:var(--asada-ink,#123f70)]',
  }
  const iconoTono = {
    adquiridas: 'bg-sky-100 text-sky-700',
    disfrutadas: 'bg-amber-100 text-amber-700',
    ajustes: 'bg-white text-[color:var(--asada-navy,#1e5a9c)]',
  }

  return (
    <div
      className={`flex min-h-0 min-w-0 items-center gap-3 rounded-2xl border px-3.5 py-3 sm:h-full sm:min-h-[3.75rem] sm:px-4 ${tonos[tono]}`}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-xl ${iconoTono[tono]}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[0.66rem] font-extrabold uppercase tracking-[0.08em] opacity-70">
          {label}
        </dt>
        <dd className="m-0 flex items-baseline gap-1.5">
          <span className="text-[1.4rem] font-black tabular-nums tracking-tight sm:text-[1.5rem]">
            {mostrar}
          </span>
          <span className="text-sm font-bold opacity-70">
            {Math.abs(mostrar) === 1 ? 'día' : 'días'}
          </span>
        </dd>
      </div>
    </div>
  )
}

type Props = {
  balance: BalanceVacaciones
  eyebrow?: string
  cargando?: boolean
  compacto?: boolean
}

/** Panel compartido de saldo — RRHH admin y Fontanero. */
export default function VacacionesSaldoPanel({
  balance,
  eyebrow = 'Saldo de vacaciones',
  cargando = false,
  compacto = false,
}: Props) {
  const disponibles = Number.isFinite(balance.diasDisponibles)
    ? balance.diasDisponibles
    : 0
  const ajuste = balance.diasAjusteNeto ?? 0

  return (
    <div
      className={`grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 sm:gap-5 ${cargando ? 'opacity-60' : ''}`}
    >
      <div className="flex min-w-0 items-start gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[color:var(--asada-navy,#1e5a9c)] text-white shadow-[0_10px_22px_rgba(30,90,156,0.28)]">
          <IconBeach size={24} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[color:var(--asada-navy,#1e5a9c)]">
            {eyebrow}
          </p>
          <h2 className="m-0 break-words text-[clamp(1.3rem,2.4vw,1.75rem)] font-black tracking-tight text-[color:var(--asada-ink,#123f70)]">
            {nombreCompleto(balance.colaborador)}
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-[color:var(--asada-muted,#5b7390)]">
            <span className="inline-flex items-center gap-1.5">
              <IconBriefcase size={15} aria-hidden="true" />
              {balance.colaborador.cargo}
            </span>
            {!compacto ? (
              <>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <IconId size={15} aria-hidden="true" />
                  {balance.colaborador.cedula}
                </span>
                <EstadoBadge activo={balance.colaborador.activo} />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid min-h-0 gap-3 sm:grid-cols-[minmax(10.5rem,0.95fr)_minmax(11.5rem,1.05fr)] sm:items-stretch">
        <dl className="relative m-0 flex min-h-[7.5rem] flex-col items-start justify-center gap-2 overflow-hidden rounded-[1.25rem] bg-[color:var(--asada-navy,#1e5a9c)] px-5 py-5 text-white shadow-[0_14px_28px_rgba(30,90,156,0.26)] sm:min-h-0 sm:h-full sm:px-6">
          <span
            className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-white/10"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-12 -left-6 size-36 rounded-full bg-black/10"
            aria-hidden="true"
          />
          <dt className="relative text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-white/80">
            Disponibles
          </dt>
          <dd className="relative m-0 flex items-baseline gap-2">
            <strong className="text-[2.75rem] font-black leading-none tracking-tight tabular-nums sm:text-[3.1rem]">
              {disponibles}
            </strong>
            <em className="text-base font-bold not-italic text-white/85">
              {Math.abs(disponibles) === 1 ? 'día' : 'días'}
            </em>
          </dd>
        </dl>

        <dl className="m-0 grid gap-2 sm:h-full sm:grid-rows-3">
          <MetricQuiet
            label="Adquiridas"
            dias={balance.diasAcumulados}
            tono="adquiridas"
            icon={<IconPlus size={16} stroke={2.25} />}
          />
          <MetricQuiet
            label="Disfrutadas"
            dias={balance.diasDisfrutados}
            tono="disfrutadas"
            icon={<IconMinus size={16} stroke={2.25} />}
          />
          <MetricQuiet
            label="Ajustes netos"
            dias={ajuste}
            tono="ajustes"
            icon={<IconAdjustmentsHorizontal size={16} stroke={2.25} />}
          />
        </dl>
      </div>
    </div>
  )
}
