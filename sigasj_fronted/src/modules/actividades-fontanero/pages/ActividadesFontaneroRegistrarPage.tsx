import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/publicRoutes'
import TipoActividadSelector from '../components/TipoActividadSelector'
import { useTiposActividadFontanero } from '../hooks/useTiposActividadFontanero'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { registrarActividadFontanero } from '../services/actividadesFontaneroApi'
import { getHttpErrorStatus } from '../utils/httpErrorStatus'

const DESCRIPCION_ID = 'actividad-descripcion'
const UBICACION_ID = 'actividad-ubicacion'

const ActividadesFontaneroRegistrarPage = () => {
  const navigate = useNavigate()
  const {
    tipos,
    isLoading,
    isError,
    isEmpty,
    isUnauthorized,
    isForbidden,
    refetch,
  } = useTiposActividadFontanero()

  const [tipoId, setTipoId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const catalogReady =
    !isLoading && !isError && !isEmpty && !isUnauthorized && !isForbidden

  useEffect(() => {
    if (isUnauthorized) {
      navigate(LOGIN_ROUTE_PATH, { replace: true })
    } else if (isForbidden) {
      navigate(UNAUTHORIZED_ROUTE_PATH, { replace: true })
    }
  }, [isForbidden, isUnauthorized, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!tipoId) {
      setFormError('Seleccione un tipo de actividad.')
      return
    }

    const tipo = tipos.find((item) => String(item.id) === tipoId)
    if (!tipo) {
      setFormError('El tipo de actividad seleccionado no es válido.')
      return
    }

    const payload = {
      titulo: tipo.nombre,
      ...(descripcion.trim() ? { descripcion: descripcion.trim() } : {}),
      ...(ubicacion.trim() ? { ubicacion: ubicacion.trim() } : {}),
    }

    setIsSubmitting(true)

    try {
      await registrarActividadFontanero(payload)
      navigate(ACTIVIDADES_FONTANERO_PATHS.home, {
        replace: true,
        state: { actividadRegistrada: true, tituloActividad: tipo.nombre },
      })
    } catch (error) {
      const status = getHttpErrorStatus(error)

      if (status === 401) {
        navigate(LOGIN_ROUTE_PATH, { replace: true })
        return
      }

      if (status === 403) {
        navigate(UNAUTHORIZED_ROUTE_PATH, { replace: true })
        return
      }

      setFormError('No se pudo registrar la actividad. Intente de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      className="actividades-fontanero-registrar"
      aria-labelledby="actividades-fontanero-registrar-title"
    >
      <header className="actividades-fontanero-registrar__header">
        <p className="actividades-fontanero-registrar__eyebrow">
          Registro de Actividades
        </p>
        <h1 id="actividades-fontanero-registrar-title">Registrar actividad</h1>
        <p className="actividades-fontanero-registrar__description">
          Seleccione el tipo de actividad que desea registrar y complete los
          datos opcionales.
        </p>
        <Link
          to={ACTIVIDADES_FONTANERO_PATHS.home}
          className="actividades-fontanero-registrar__back"
        >
          Volver al menú de actividades
        </Link>
      </header>

      <form className="actividades-fontanero-registrar__form" onSubmit={handleSubmit}>
        <TipoActividadSelector
          tipos={tipos}
          value={tipoId}
          onChange={setTipoId}
          isLoading={isLoading}
          isError={isError && !isUnauthorized && !isForbidden}
          isEmpty={isEmpty}
          onRetry={refetch}
          disabled={isSubmitting || !catalogReady}
        />

        <label className="actividades-fontanero-registrar__field" htmlFor={DESCRIPCION_ID}>
          <span>Descripción</span>
          <textarea
            id={DESCRIPCION_ID}
            rows={3}
            maxLength={500}
            value={descripcion}
            disabled={isSubmitting || !catalogReady}
            onChange={(event) => setDescripcion(event.target.value)}
            data-testid="actividad-descripcion"
          />
        </label>

        <label className="actividades-fontanero-registrar__field" htmlFor={UBICACION_ID}>
          <span>Ubicación</span>
          <input
            id={UBICACION_ID}
            type="text"
            maxLength={200}
            value={ubicacion}
            disabled={isSubmitting || !catalogReady}
            onChange={(event) => setUbicacion(event.target.value)}
            data-testid="actividad-ubicacion"
          />
        </label>

        {formError ? (
          <p
            className="actividades-fontanero-registrar__form-error"
            role="alert"
            data-testid="registrar-actividad-error"
          >
            {formError}
          </p>
        ) : null}

        <div className="actividades-fontanero-registrar__actions">
          <Link
            to={ACTIVIDADES_FONTANERO_PATHS.home}
            className="actividades-fontanero-registrar__cancel"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="actividades-fontanero-registrar__submit"
            disabled={isSubmitting || !catalogReady}
            data-testid="registrar-actividad-submit"
          >
            {isSubmitting ? 'Registrando…' : 'Registrar actividad'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default ActividadesFontaneroRegistrarPage
