import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import {
  toProyectoFormValues,
  type AdminProyectoDetalle,
  type ProyectoFormValues,
} from './types'
import ProyectosAdminForm from './ProyectosAdminForm'
import ProyectosAdminFormPageLayout from './ProyectosAdminFormPageLayout'
import {
  parseProyectoSubmitError,
  PROYECTO_NOT_FOUND_ERROR,
} from './proyectoSubmitError'
import { PROYECTOS_ADMIN_PATH } from './proyectosAdminPaths'
import { getAdminProyecto, updateAdminProyecto } from '../services/proyectosApi'

const parseProyectoId = (value: string | undefined): number | null => {
  if (!value) {
    return null
  }

  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

const ProyectosAdminEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const proyectoId = parseProyectoId(id)
  const [detail, setDetail] = useState<AdminProyectoDetalle | null>(null)
  const [detailLoading, setDetailLoading] = useState(proyectoId !== null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailMissing, setDetailMissing] = useState(proyectoId === null)
  const [detailReload, setDetailReload] = useState(0)

  const closeForm = () => {
    navigate(PROYECTOS_ADMIN_PATH)
  }

  useEffect(() => {
    if (proyectoId === null) {
      return
    }

    let cancelled = false

    void getAdminProyecto(proyectoId)
      .then((proyecto) => {
        if (!cancelled) {
          setDetail(proyecto)
          setDetailMissing(false)
          setDetailLoading(false)
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }

        const parsed = parseProyectoSubmitError(error)
        setDetail(null)
        setDetailLoading(false)

        if (parsed.kind === 'unauthorized') {
          navigate(LOGIN_ROUTE_PATH, { replace: true })
          return
        }
        if (parsed.kind === 'forbidden') {
          navigate(UNAUTHORIZED_ROUTE_PATH, { replace: true })
          return
        }
        if (parsed.kind === 'not-found') {
          setDetailMissing(true)
          setDetailError(null)
          return
        }

        setDetailMissing(false)
        setDetailError('No fue posible cargar el proyecto.')
      })

    return () => {
      cancelled = true
    }
  }, [proyectoId, detailReload, navigate])

  const formInitialValues = useMemo(
    () => (detail ? toProyectoFormValues(detail) : undefined),
    [detail],
  )

  const handleSave = async (values: ProyectoFormValues) => {
    if (proyectoId === null) {
      return
    }

    try {
      await updateAdminProyecto(proyectoId, values)
      closeForm()
    } catch (error) {
      const parsed = parseProyectoSubmitError(error)

      if (parsed.kind === 'unauthorized') {
        navigate(LOGIN_ROUTE_PATH, { replace: true })
      } else if (parsed.kind === 'forbidden') {
        navigate(UNAUTHORIZED_ROUTE_PATH, { replace: true })
      } else if (parsed.kind === 'not-found') {
        setDetail(null)
        setDetailMissing(true)
        setDetailError(null)
        setDetailLoading(false)
      }

      throw error
    }
  }

  return (
    <ProyectosAdminFormPageLayout>
      {detailLoading ? (
        <p className="gallery-admin__empty" role="status">
          Cargando proyecto…
        </p>
      ) : null}

      {!detailLoading && detailMissing ? (
        <div className="gallery-admin__empty" role="alert">
          <p>{PROYECTO_NOT_FOUND_ERROR}</p>
          <button type="button" className="gallery-admin__button" onClick={closeForm}>
            Volver al listado
          </button>
        </div>
      ) : null}

      {!detailLoading && detailError ? (
        <div className="gallery-admin__empty" role="alert">
          <p>{detailError}</p>
          <button
            type="button"
            className="gallery-admin__button"
            onClick={() => {
              setDetailLoading(true)
              setDetailError(null)
              setDetailMissing(false)
              setDetailReload((current) => current + 1)
            }}
          >
            Reintentar
          </button>
          <button type="button" className="gallery-admin__button" onClick={closeForm}>
            Cancelar
          </button>
        </div>
      ) : null}

      {detail && formInitialValues && !detailLoading && !detailMissing ? (
        <ProyectosAdminForm
          mode="edit"
          initialValues={formInitialValues}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      ) : null}
    </ProyectosAdminFormPageLayout>
  )
}

export default ProyectosAdminEditPage
