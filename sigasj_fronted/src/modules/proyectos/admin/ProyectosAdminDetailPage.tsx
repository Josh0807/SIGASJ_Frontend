import { Link, Navigate, useParams } from 'react-router-dom'
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
          <Link className="gallery-admin__button" to={PROYECTOS_ADMIN_PATH}>
            Volver al listado
          </Link>
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
          <Link className="gallery-admin__button" to={PROYECTOS_ADMIN_PATH}>
            Volver al listado
          </Link>
        </div>
      ) : null}

      {proyecto && !sessionBlocked && !missing ? (
        <>
          <p className="gallery-admin__header-actions">
            <Link
              className="gallery-admin__button gallery-admin__button--primary"
              to={proyectosAdminEditPath(proyecto.id)}
            >
              Editar
            </Link>
          </p>
          <ProyectosAdminDetailView proyecto={proyecto} />
        </>
      ) : null}
    </ProyectosAdminFormPageLayout>
  )
}

export default ProyectosAdminDetailPage
