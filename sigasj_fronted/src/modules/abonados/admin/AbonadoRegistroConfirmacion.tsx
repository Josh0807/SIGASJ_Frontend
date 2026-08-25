import { Link } from 'react-router-dom'
import type { RegistroResumen } from '../services/abonadosApi'

type AbonadoRegistroConfirmacionProps = {
  resumen: RegistroResumen
  onRegisterAnother: () => void
}

const AbonadoRegistroConfirmacion = ({
  resumen,
  onRegisterAnother,
}: AbonadoRegistroConfirmacionProps) => {
  const nombreCompleto = `${resumen.nombre} ${resumen.apellidos}`.trim()

  return (
    <section
      className="gallery-admin__form"
      aria-labelledby="registro-confirmacion-title"
    >
      <p
        className="gallery-admin__banner gallery-admin__banner--success"
        role="status"
      >
        {resumen.mensaje}
      </p>

      <h2 id="registro-confirmacion-title">Registro completado</h2>
      <p>El abonado quedó registrado correctamente en el sistema.</p>

      <dl className="gallery-admin__summary">
        <div className="gallery-admin__summary-item">
          <dt>ID abonado</dt>
          <dd>{resumen.idAbonado}</dd>
        </div>
        <div className="gallery-admin__summary-item">
          <dt>Nombre</dt>
          <dd>{nombreCompleto}</dd>
        </div>
        <div className="gallery-admin__summary-item">
          <dt>Cédula</dt>
          <dd>{resumen.cedula}</dd>
        </div>
        <div className="gallery-admin__summary-item">
          <dt>NIS</dt>
          <dd>{resumen.nis}</dd>
        </div>
        <div className="gallery-admin__summary-item">
          <dt>Medidor</dt>
          <dd>{resumen.medidor}</dd>
        </div>
      </dl>

      <div className="gallery-admin__form-actions">
        <Link
          className="gallery-admin__button gallery-admin__button--primary"
          to={`/admin/abonados/${resumen.idAbonado}`}
          state={{ resumen }}
        >
          Consultar abonado
        </Link>
        <button type="button" className="gallery-admin__button" onClick={onRegisterAnother}>
          Registrar otro abonado
        </button>
        <Link className="gallery-admin__link" to="/admin/abonados">
          Volver al listado
        </Link>
      </div>
    </section>
  )
}

export default AbonadoRegistroConfirmacion
