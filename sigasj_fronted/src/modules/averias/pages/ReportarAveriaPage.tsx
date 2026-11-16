import { IconDropletExclamation } from '@tabler/icons-react'
import PublicFormPage from '../../landing/components/PublicFormPage'
import ReportarAveriaForm from '../components/ReportarAveriaForm'

const ReportarAveriaPage = () => (
  <PublicFormPage
    returnTo="/#reporte-averias"
    eyebrow="Servicio de agua potable"
    title="Reportar una avería"
    description="Complete la siguiente información para informar a la ASADA sobre una avería relacionada con el servicio de agua potable."
    ariaLabel="Formulario público de reporte de averías"
    icon={<IconDropletExclamation size={36} aria-hidden="true" />}
    maxWidth="xl"
    card
  >
    <ReportarAveriaForm />
  </PublicFormPage>
)

export default ReportarAveriaPage
