import { Link } from 'react-router-dom'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'

type ActividadesFontaneroStubPageProps = {
  title: string
  description: string
  emptyMessage?: string
  backPath?: string
  backLabel?: string
}

const ActividadesFontaneroStubPage = ({
  title,
  description,
  emptyMessage,
  backPath = ACTIVIDADES_FONTANERO_PATHS.home,
  backLabel = 'Volver al menú de actividades',
}: ActividadesFontaneroStubPageProps) => (
  <section
    className="actividades-fontanero-stub"
    aria-labelledby="actividades-fontanero-stub-title"
  >
    <p className="actividades-fontanero-stub__eyebrow">Registro de Actividades</p>
    <h1 id="actividades-fontanero-stub-title">{title}</h1>
    <p className="actividades-fontanero-stub__description">{description}</p>
    {emptyMessage ? (
      <p className="actividades-fontanero-stub__empty" role="status">
        {emptyMessage}
      </p>
    ) : null}
    <Link to={backPath} className="actividades-fontanero-stub__back">
      {backLabel}
    </Link>
  </section>
)

export default ActividadesFontaneroStubPage
