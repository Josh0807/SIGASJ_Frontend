import { Link } from 'react-router-dom'
import type { PublicFormPlaceholderProps } from '../props'

export type { PublicFormPlaceholderProps }

const PublicFormPlaceholder = ({ label }: PublicFormPlaceholderProps) => (
  <main className="admin-surface-page private-module-placeholder" aria-labelledby="public-form-placeholder-title">
    <div className="admin-surface-card private-module-placeholder__card">
      <p className="private-module-placeholder__eyebrow">Solicitud pública</p>
      <h1 id="public-form-placeholder-title">{label}</h1>
      <p>
        El formulario digital de este trámite aún no está habilitado. Puede
        volver a la sección de solicitudes para descargar el PDF oficial o
        completar el trámite de forma presencial en la ASADA.
      </p>
      <Link className="gallery-admin__button gallery-admin__button--primary" to="/#solicitudes-servicio">
        Volver a solicitudes
      </Link>
    </div>
  </main>
)

export default PublicFormPlaceholder
