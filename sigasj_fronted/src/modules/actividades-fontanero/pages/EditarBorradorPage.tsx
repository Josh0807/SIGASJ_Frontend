import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ActividadRegistroFormShell from '../components/ActividadRegistroFormShell'
import ActivityFeedback from '../components/ActivityFeedback'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { useTiposActividadFontanero } from '../hooks/useTiposActividadFontanero'
import {
  actualizarBorradorActividad,
  eliminarBorradorActividad,
  getActividadDetalle,
  registrarBorradorActividad,
} from '../services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { actividadToFormValues } from '../utils/actividadCorreccionMapper'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { getHttpErrorStatus } from '../utils/httpErrorStatus'
import { useAuth } from '../../auth/components/AuthContext'

const EditarBorradorPage = () => {
  const { actividadId } = useParams<{ actividadId: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const catalogo = useTiposActividadFontanero()
  const [actividad, setActividad] = useState<ActividadFontaneroRegistrada | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<'not-found' | 'error' | 'forbidden' | null>(
    null,
  )

  const parsedId = Number(actividadId)
  const isInvalidId = !Number.isInteger(parsedId) || parsedId <= 0

  useEffect(() => {
    if (isInvalidId) {
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const detalle = await getActividadDetalle(parsedId)
        if (cancelled) {
          return
        }
        if (detalle.estado !== 'BORRADOR') {
          setLoadError('forbidden')
          setActividad(null)
          return
        }
        setActividad(detalle)
      } catch (error) {
        if (cancelled) {
          return
        }
        const status = getHttpErrorStatus(error)
        if (status === 401) {
          logout()
          navigate('/login', { replace: true })
          return
        }
        setLoadError(status === 404 ? 'not-found' : status === 403 ? 'forbidden' : 'error')
        setActividad(null)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [isInvalidId, parsedId, logout, navigate])

  if (isInvalidId) {
    return <Navigate to={ACTIVIDADES_FONTANERO_PATHS.misActividades} replace />
  }

  if (isLoading || catalogo.isLoading) {
    return <p role="status">Cargando borrador…</p>
  }

  if (loadError || !actividad) {
    return (
      <section>
        <ActivityFeedback
          variant="error"
          message={
            loadError === 'forbidden'
              ? 'Este registro no es un borrador editable.'
              : ACTIVITY_FEEDBACK_MESSAGES.loadGeneric
          }
        />
        <Link to={ACTIVIDADES_FONTANERO_PATHS.misActividades}>
          Volver a mis actividades
        </Link>
      </section>
    )
  }

  const tipo = catalogo.tipos.find((item) => item.id === actividad.tipoActividadId)
  if (!tipo) {
    return (
      <ActivityFeedback
        variant="warning"
        message="No se encontró el tipo de actividad asociado."
      />
    )
  }

  return (
    <ActividadRegistroFormShell
      key={actividad.id}
      mode="editar-borrador"
      tipo={tipo}
      initialValues={{
        ...actividadToFormValues(actividad),
        fechaFin: '',
        horaFin: '',
      }}
      existingDocumentos={actividad.documentos}
      actividadId={actividad.id}
      onSubmit={(values, extras) =>
        extras?.intent === 'registrar'
          ? registrarBorradorActividad(
              actividad.id,
              tipo,
              values,
              extras.documentosEliminarIds,
            )
          : actualizarBorradorActividad(
              actividad.id,
              tipo,
              values,
              extras?.documentosEliminarIds,
            )
      }
      onDelete={async () => {
        await eliminarBorradorActividad(actividad.id)
        navigate(ACTIVIDADES_FONTANERO_PATHS.misActividades, { replace: true })
      }}
      onCatalogStale={catalogo.refetch}
    />
  )
}

export default EditarBorradorPage
