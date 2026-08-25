import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AbonadoRegistroForm from './AbonadoRegistroForm'
import type { AbonadoRegistroFormValues } from './types'
import {
  getSolicitudesPendientes,
  registerAbonado,
  type RegistroResumen,
  type SolicitudPendiente,
} from '../services/abonadosApi'

const parseServerError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return 'No fue posible registrar el abonado.'
  }

  const detail = error.message.replace(/^HTTP \d+:\s*/, '')
  return detail || 'No fue posible registrar el abonado.'
}

const AbonadoRegistroPage = () => {
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>([])
  const [solicitudesMensaje, setSolicitudesMensaje] = useState<string | null>(null)
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState<RegistroResumen | null>(null)

  const loadSolicitudes = useCallback(async () => {
    setLoadingSolicitudes(true)

    try {
      const response = await getSolicitudesPendientes()
      setSolicitudes(response.solicitudes)
      setSolicitudesMensaje(response.mensaje)
    } catch {
      setSolicitudes([])
      setSolicitudesMensaje('No fue posible cargar las solicitudes aprobadas.')
    } finally {
      setLoadingSolicitudes(false)
    }
  }, [])

  useEffect(() => {
    void loadSolicitudes()
  }, [loadSolicitudes])

  const handleSubmit = async (values: AbonadoRegistroFormValues) => {
    setSubmitting(true)
    setServerError(null)

    try {
      const response = await registerAbonado(values)
      setSuccess({
        idAbonado: response.idAbonado,
        mensaje: response.mensaje,
        cedula: values.cedula.trim(),
        nis: values.servicio.nis.trim(),
        medidor: values.servicio.medidor.trim(),
      })
    } catch (error) {
      setServerError(parseServerError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegisterAnother = () => {
    setSuccess(null)
    setServerError(null)
    void loadSolicitudes()
  }

  if (success) {
    return (
      <main className="gallery-admin" aria-labelledby="abonados-admin-title">
        <header className="gallery-admin__header">
          <h1 id="abonados-admin-title">Gestión de abonados</h1>
        </header>

        <section className="gallery-admin__panel">
          <h2>Registro completado</h2>
          <p>{success.mensaje}</p>
          <ul>
            <li>ID abonado: {success.idAbonado}</li>
            <li>Cédula: {success.cedula}</li>
            <li>NIS: {success.nis}</li>
            <li>Medidor: {success.medidor}</li>
          </ul>
          <div className="gallery-admin__actions">
            <Link to="/admin/abonados">Volver al listado</Link>
            <button type="button" onClick={handleRegisterAnother}>
              Registrar otro abonado
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="gallery-admin" aria-labelledby="abonados-admin-title">
      <header className="gallery-admin__header">
        <div>
          <h1 id="abonados-admin-title">Gestión de abonados</h1>
          <p>Complete la información personal y del servicio de agua.</p>
        </div>
        <Link to="/admin/abonados">Volver al listado</Link>
      </header>

      {loadingSolicitudes ? (
        <p className="gallery-admin__status">Cargando solicitudes aprobadas…</p>
      ) : null}

      <AbonadoRegistroForm
        solicitudes={solicitudes}
        solicitudesMensaje={solicitudesMensaje}
        loadingSolicitudes={loadingSolicitudes}
        submitting={submitting}
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/abonados')}
      />
    </main>
  )
}

export default AbonadoRegistroPage
