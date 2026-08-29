import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { emptyProyectoFormValues, type ProyectoFormValues } from './types'
import ProyectosAdminForm from './ProyectosAdminForm'
import ProyectosAdminFormPageLayout from './ProyectosAdminFormPageLayout'
import { parseProyectoSubmitError } from './proyectoSubmitError'
import { PROYECTOS_ADMIN_PATH } from './proyectosAdminPaths'
import { createAdminProyecto } from '../services/proyectosApi'

const ProyectosAdminCreatePage = () => {
  const navigate = useNavigate()
  const initialValues = useMemo(() => emptyProyectoFormValues(), [])

  const closeForm = () => {
    navigate(PROYECTOS_ADMIN_PATH)
  }

  const handleSave = async (
    values: ProyectoFormValues,
    imagenFile?: File | null,
  ) => {
    try {
      await createAdminProyecto(values, imagenFile)
      closeForm()
    } catch (error) {
      const parsed = parseProyectoSubmitError(error)

      if (parsed.kind === 'unauthorized') {
        navigate(LOGIN_ROUTE_PATH, { replace: true })
      } else if (parsed.kind === 'forbidden') {
        navigate(UNAUTHORIZED_ROUTE_PATH, { replace: true })
      }

      throw error
    }
  }

  return (
    <ProyectosAdminFormPageLayout>
      <ProyectosAdminForm
        mode="create"
        initialValues={initialValues}
        onSubmit={handleSave}
        onCancel={closeForm}
      />
    </ProyectosAdminFormPageLayout>
  )
}

export default ProyectosAdminCreatePage
