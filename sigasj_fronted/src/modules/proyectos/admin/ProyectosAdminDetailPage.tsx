import { Navigate, useParams } from 'react-router-dom'
import { Button } from '../../../shared/ui'
import { UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/routePaths'
import ProyectosAdminDetailView from './ProyectosAdminDetailView'
import ProyectosAdminFormPageLayout from './ProyectosAdminFormPageLayout'
import ProyectosAdminMissingState from './ProyectosAdminMissingState'
import {
  PROYECTOS_ADMIN_PATH,
  proyectosAdminEditPath,
} from './proyectosAdminPaths'
import { useAdminProyecto } from '../hooks/useAdminProyecto'

const ProyectosAdminDetailPage = () => {
  const { id } = useParams()
  const {
    proyecto,
    loading,
    error,
    missing,
    unauthorized,
    forbidden,
    refetch,
  } = useAdminProyecto(id)

  if (forbidden) {
    return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  }

  const sessionBlocked = loading || unauthorized

  return (
    <ProyectosAdminFormPageLayout>
      {sessionBlocked ? (
        <p className="gallery-admin__empty" role="status">
          Cargando proyecto…
        </p>
      ) : null}

      {!sessionBlocked && missing ? (
        <ProyectosAdminMissingState>
          <Button to={PROYECTOS_ADMIN_PATH} variant="secondary">
            Volver al listado
          </Button>
        </ProyectosAdminMissingState>
      ) : null}

      {!sessionBlocked && error && !missing ? (
        <div className="gallery-admin__empty" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="gallery-admin__button"
            onClick={() => {
              refetch()
            }}
          >
            Reintentar
          </button>
          <Button to={PROYECTOS_ADMIN_PATH} variant="secondary">
            Volver al listado
          </Button>
        </div>
      ) : null}

      {proyecto && !sessionBlocked && !missing ? (
        <div className="proyectos-admin__detail-page">
          <div className="proyectos-admin__detail-actions">
            <Button to={PROYECTOS_ADMIN_PATH} variant="secondary">
              Volver al listado
            </Button>
            <Button to={proyectosAdminEditPath(proyecto.id)} variant="primary">
              Editar proyecto
            </Button>
          </div>
          <ProyectosAdminDetailView proyecto={proyecto} />
        </div>
      ) : null}
    </ProyectosAdminFormPageLayout>
  )
}

export default ProyectosAdminDetailPage
