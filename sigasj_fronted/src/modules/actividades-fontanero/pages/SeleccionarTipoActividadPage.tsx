import { Link } from 'react-router-dom'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { useTiposActividadFontanero } from '../hooks/useTiposActividadFontanero'

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
    {catalogo.isUnauthorized ? <p role="alert">Su sesión no es válida o ha vencido.</p> : null}
    {catalogo.isForbidden ? <p role="alert">No tiene permiso para consultar los tipos de actividad.</p> : null}
    {catalogo.isError ? <p role="alert">No se pudo cargar el catálogo. <button type="button" onClick={catalogo.refetch}>Reintentar</button></p> : null}
    {catalogo.isEmpty ? <p role="status">No hay tipos de actividad disponibles.</p> : null}
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
          {tipo.descripcion ? <p className="actividad-tipo-selector__description">{tipo.descripcion}</p> : null}
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
