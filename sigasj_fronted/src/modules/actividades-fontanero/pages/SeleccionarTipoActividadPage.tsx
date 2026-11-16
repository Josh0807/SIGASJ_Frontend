import { IconArrowLeft, IconArrowRight, IconClipboardCheck } from '@tabler/icons-react'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import {
  AdminShell,
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from '../../../shared/ui'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { useTiposActividadFontanero } from '../hooks/useTiposActividadFontanero'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'

const SeleccionarTipoActividadPage = () => {
  const catalogo = useTiposActividadFontanero()
  return (
    <AdminShell
      className="actividades-fontanero-registro actividades-fontanero-registro--selector gap-5 sm:gap-6"
      aria-labelledby="seleccion-tipo-actividad-title"
    >
      <PageHeader
        id="seleccion-tipo-actividad-title"
        title="Registrar actividad"
        description="Seleccione el tipo. Cada opción abre su formulario."
        actions={
          <Button
            to={ACTIVIDADES_FONTANERO_PATHS.home}
            variant="secondary"
            leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
          >
            Volver
          </Button>
        }
      />

      {catalogo.isLoading ? (
        <Alert tone="info" role="status">
          {ADMIN_COPY.loading('tipos de actividad')}
        </Alert>
      ) : null}
      {catalogo.isUnauthorized ? (
        <Alert tone="warning">{ACTIVITY_FEEDBACK_MESSAGES.unauthorized}</Alert>
      ) : null}
      {catalogo.isForbidden ? (
        <Alert tone="danger">{ACTIVITY_FEEDBACK_MESSAGES.forbidden}</Alert>
      ) : null}
      {catalogo.isError ? (
        <Alert tone="danger">
          <div className="grid gap-3">
            <p className="m-0 font-semibold">{ACTIVITY_FEEDBACK_MESSAGES.loadGeneric}</p>
            <Button type="button" variant="secondary" size="sm" onClick={catalogo.refetch}>
              {ADMIN_COPY.retry}
            </Button>
          </div>
        </Alert>
      ) : null}
      {catalogo.isEmpty ? (
        <EmptyState title="No hay tipos de actividad disponibles." />
      ) : null}

      <Card
        as="section"
        padded
        className="actividad-tipo-selector grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        role="list"
        aria-label="Tipos de actividad disponibles"
      >
        <div className="col-span-full border-b border-sigasj-border pb-4" role="presentation">
          <h2 className="m-0 text-lg font-extrabold text-sigasj-ink">
            Seleccione una actividad
          </h2>
          <p className="mt-1 text-sm text-sigasj-muted">
            Elija una opción para abrir su formulario correspondiente.
          </p>
        </div>
        {catalogo.tipos.map((tipo) => (
          <Card
            key={tipo.codigo}
            as="article"
            padded
            interactive
            className="actividad-tipo-selector__card grid gap-4"
            role="listitem"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sigasj-primary text-white">
                <IconClipboardCheck size={22} aria-hidden="true" />
              </span>
              <h3 className="actividad-tipo-selector__title m-0 text-base font-extrabold text-sigasj-ink">
                {tipo.nombre}
              </h3>
            </div>
            {tipo.descripcion ? (
              <p className="actividad-tipo-selector__description m-0 text-sm text-sigasj-muted">
                {tipo.descripcion}
              </p>
            ) : null}
            <Button
              to={ACTIVIDADES_FONTANERO_PATHS.registrarTipo(tipo.codigo)}
              variant="primary"
              className="actividad-tipo-selector__link mt-auto w-full justify-between"
              rightIcon={<IconArrowRight size={18} aria-hidden="true" />}
              data-testid={`tipo-actividad-${tipo.codigo}`}
            >
              Continuar
            </Button>
          </Card>
        ))}
      </Card>
    </AdminShell>
  )
}

export default SeleccionarTipoActividadPage
