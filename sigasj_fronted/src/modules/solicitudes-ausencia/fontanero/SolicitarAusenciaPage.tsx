import { IconBeach, IconCalendarEvent, IconClipboardList } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { AdminShell, Button, Card, PageHeader } from '../../../shared/ui'
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
    <AdminShell
      className="mx-auto max-w-5xl gap-5 sm:gap-6"
      aria-labelledby="solicitar-ausencia-title"
    >
      <PageHeader
        id="solicitar-ausencia-title"
        eyebrow="Fontanero"
        title={
          <span className="inline-flex items-center gap-2">
            <IconClipboardList size={22} aria-hidden="true" />
            {FONTANERO_SOLICITAR_AUSENCIA_TITLE}
          </span>
        }
        description="Elija el tipo de trámite. Un permiso no descuenta vacaciones; las vacaciones sí usan el saldo disponible al aprobarse."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to={FONTANERO_SOLICITAR_PERMISO_PATH}
          className="no-underline"
        >
          <Card interactive padded className="grid h-full gap-3">
            <IconCalendarEvent className="text-sigasj-primary" size={28} aria-hidden="true" />
            <h2 className="m-0 text-lg font-extrabold text-sigasj-ink">
              {FONTANERO_SOLICITAR_PERMISO_TITLE}
            </h2>
            <p className="m-0 text-sm leading-relaxed text-sigasj-muted">
              Citas, trámites u otros asuntos. Requiere motivo y puede ser de un
              solo día.
            </p>
          </Card>
        </Link>
        <Link
          to={FONTANERO_SOLICITAR_VACACIONES_PATH}
          className="no-underline"
        >
          <Card interactive padded className="grid h-full gap-3">
            <IconBeach className="text-sigasj-primary" size={28} aria-hidden="true" />
            <h2 className="m-0 text-lg font-extrabold text-sigasj-ink">
              {FONTANERO_SOLICITAR_VACACIONES_TITLE}
            </h2>
            <p className="m-0 text-sm leading-relaxed text-sigasj-muted">
              Disfrute de días acumulados. Verá su saldo actual antes de enviar.
            </p>
          </Card>
        </Link>
      </div>

      <Button to={FONTANERO_MIS_SOLICITUDES_PATH} variant="secondary" size="sm">
        Ver mis solicitudes
      </Button>
    </AdminShell>
  )
}