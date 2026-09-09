import { Link } from 'react-router-dom'
import ActivityFeedback from '../components/ActivityFeedback'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { useTiposActividadFontanero } from '../hooks/useTiposActividadFontanero'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'

const SeleccionarTipoActividadPage = () => {
  const catalogo = useTiposActividadFontanero()
  return (
    <section
      className="actividades-fontanero-registro actividades-fontanero-registro--selector"
      aria-labelledby="seleccion-tipo-actividad-title"
    >
      <header className="actividades-fontanero-registro__header">
        <p className="actividades-fontanero-registro__eyebrow">Registro de Actividades</p>
        <h1 id="seleccion-tipo-actividad-title">Registrar actividad</h1>
        <p className="actividades-fontanero-registro__intro">
          Seleccione el tipo de actividad que desea registrar. Cada tipo abre su formulario
          correspondiente.
        </p>
      </header>

      {catalogo.isLoading ? <p role="status">Cargando tipos de actividad…</p> : null}
      {catalogo.isUnauthorized ? (
        <ActivityFeedback
          variant="warning"
          message={ACTIVITY_FEEDBACK_MESSAGES.unauthorized}
        />
      ) : null}
      {catalogo.isForbidden ? (
        <ActivityFeedback
          variant="error"
          message={ACTIVITY_FEEDBACK_MESSAGES.forbidden}
        />
      ) : null}
      {catalogo.isError ? (
        <ActivityFeedback
          variant="error"
          message={ACTIVITY_FEEDBACK_MESSAGES.loadGeneric}
          action={
            <button type="button" className="activity-feedback__retry" onClick={catalogo.refetch}>
              Reintentar
            </button>
          }
        />
      ) : null}
      {catalogo.isEmpty ? (
        <ActivityFeedback
          variant="info"
          message="No hay tipos de actividad disponibles."
        />
      ) : null}

      <div
        className="actividad-tipo-selector"
        role="list"
        aria-label="Tipos de actividad disponibles"
      >
        {catalogo.tipos.map((tipo) => (
          <article
            key={tipo.codigo}
            className="actividad-tipo-selector__card"
            role="listitem"
          >
            <h2 className="actividad-tipo-selector__title">{tipo.nombre}</h2>
            {tipo.descripcion ? (
              <p className="actividad-tipo-selector__description">{tipo.descripcion}</p>
            ) : null}
            <Link
              to={ACTIVIDADES_FONTANERO_PATHS.registrarTipo(tipo.codigo)}
              className="actividad-tipo-selector__link"
              data-testid={`tipo-actividad-${tipo.codigo}`}
            >
              Continuar con {tipo.nombre}
            </Link>
          </article>
        ))}
      </div>

      <Link to={ACTIVIDADES_FONTANERO_PATHS.home} className="actividades-fontanero-registro__back">
        Volver al menú de actividades
      </Link>
    </section>
  )
}

export default SeleccionarTipoActividadPage
