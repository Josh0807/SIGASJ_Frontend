import type { TipoActividadFontaneroCatalogo } from '../../types/tipoActividadFontanero'

type FormularioActividadPlaceholderProps = {
  tipo: TipoActividadFontaneroCatalogo
}

const FormularioActividadPlaceholder = ({
  tipo,
}: FormularioActividadPlaceholderProps) => (
  <section
    className="actividad-formulario-especifico actividad-formulario-especifico--placeholder"
    aria-labelledby={`formulario-${tipo.codigo}-title`}
  >
    <h2 id={`formulario-${tipo.codigo}-title`} className="actividad-formulario-especifico__title">
      Formulario: {tipo.nombre}
    </h2>
    <p className="actividad-formulario-especifico__hint" role="status">
      Los campos específicos de {tipo.nombre} se cargarán aquí en el backlog
      correspondiente. Por ahora complete la información general del registro.
    </p>
  </section>
)

export default FormularioActividadPlaceholder
