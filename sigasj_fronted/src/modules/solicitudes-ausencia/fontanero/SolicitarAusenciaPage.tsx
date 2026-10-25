import { IconBeach, IconCalendarEvent, IconClipboardList } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import {
  FONTANERO_MIS_SOLICITUDES_PATH,
  FONTANERO_SOLICITAR_AUSENCIA_TITLE,
  FONTANERO_SOLICITAR_PERMISO_PATH,
  FONTANERO_SOLICITAR_PERMISO_TITLE,
  FONTANERO_SOLICITAR_VACACIONES_PATH,
  FONTANERO_SOLICITAR_VACACIONES_TITLE,
} from '../solicitudesAusenciaPaths'

/**
 * Hub Fontanero: permiso y vacaciones son trámites distintos.
 */
export default function SolicitarAusenciaPage() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 overflow-x-hidden px-4 py-6 sm:px-6">
      <header className="rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
          Fontanero
        </p>
        <h1 className="m-0 flex items-center gap-3 text-2xl font-black tracking-tight text-[#062e63] sm:text-4xl">
          <IconClipboardList
            className="shrink-0 text-blue-600"
            size={34}
            aria-hidden="true"
          />
          {FONTANERO_SOLICITAR_AUSENCIA_TITLE}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
          Elija el tipo de trámite. Un permiso no descuenta vacaciones; las
          vacaciones sí usan el saldo disponible al aprobarse.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to={FONTANERO_SOLICITAR_PERMISO_PATH}
          className="grid gap-3 rounded-2xl border border-sky-100 bg-white p-6 no-underline shadow-[0_12px_30px_rgba(30,90,156,0.07)] transition hover:-translate-y-0.5 hover:border-blue-200 motion-reduce:transform-none"
        >
          <IconCalendarEvent className="text-blue-600" size={32} aria-hidden="true" />
          <h2 className="m-0 text-xl font-black text-[#062e63]">
            {FONTANERO_SOLICITAR_PERMISO_TITLE}
          </h2>
          <p className="m-0 leading-6 text-slate-500">
            Citas, trámites u otros asuntos. Requiere motivo y puede ser de un
            solo día.
          </p>
        </Link>
        <Link
          to={FONTANERO_SOLICITAR_VACACIONES_PATH}
          className="grid gap-3 rounded-2xl border border-sky-100 bg-white p-6 no-underline shadow-[0_12px_30px_rgba(30,90,156,0.07)] transition hover:-translate-y-0.5 hover:border-blue-200 motion-reduce:transform-none"
        >
          <IconBeach className="text-blue-600" size={32} aria-hidden="true" />
          <h2 className="m-0 text-xl font-black text-[#062e63]">
            {FONTANERO_SOLICITAR_VACACIONES_TITLE}
          </h2>
          <p className="m-0 leading-6 text-slate-500">
            Disfrute de días acumulados. Verá su saldo actual antes de enviar.
          </p>
        </Link>
      </div>

      <Link
        to={FONTANERO_MIS_SOLICITUDES_PATH}
        className="inline-flex w-fit min-h-11 items-center font-bold text-blue-800"
      >
        Ver mis solicitudes
      </Link>
    </div>
  )
}
