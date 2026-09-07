import { Link } from 'react-router-dom'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { CATALOGO_TIPOS_ACTIVIDAD } from '../types/tipoActividadFontanero'

const SeleccionarTipoActividadPage = () => (
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

    <div
      className="actividad-tipo-selector"
      role="list"
      aria-label="Tipos de actividad disponibles"
    >
      {CATALOGO_TIPOS_ACTIVIDAD.map((tipo) => (
        <article
          key={tipo.codigo}
          className="actividad-tipo-selector__card"
          role="listitem"
        >
          <h2 className="actividad-tipo-selector__title">{tipo.nombre}</h2>
          <p className="actividad-tipo-selector__description">{tipo.descripcion}</p>
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

export default SeleccionarTipoActividadPage
