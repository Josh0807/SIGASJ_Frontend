import { useCorreccionesPendientesCount } from '../hooks/useCorreccionesPendientesCount'
import ActividadesFontaneroStubPage from './ActividadesFontaneroStubPage'

const ActividadesFontaneroCorreccionesPage = () => {
  const { count, isLoading, isError, isUnauthorized } =
    useCorreccionesPendientesCount()

  let emptyMessage: string | undefined

  if (isUnauthorized) {
    emptyMessage =
      'Su sesión no es válida o ha vencido. Vuelva a iniciar sesión.'
  } else if (isError) {
    emptyMessage = 'No se pudieron cargar las correcciones pendientes.'
  } else if (isLoading) {
    emptyMessage = 'Cargando correcciones pendientes…'
  } else if (!count) {
    emptyMessage = 'No tiene actividades pendientes de corrección.'
  }

  return (
    <ActividadesFontaneroStubPage
      title="Correcciones pendientes"
      description="Aquí podrá atender las actividades que requieren ajuste antes de reenviarlas."
      emptyMessage={emptyMessage}
    />
  )
}

export default ActividadesFontaneroCorreccionesPage
