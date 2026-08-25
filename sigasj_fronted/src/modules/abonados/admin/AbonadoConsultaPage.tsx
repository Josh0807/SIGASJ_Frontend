import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  getAbonadoById,
  type AbonadoDetail,
  type RegistroResumen,
} from '../services/abonadosApi'

type ConsultaLocationState = {
  resumen?: RegistroResumen
}

const AbonadoConsultaPage = () => {
  const { id } = useParams()
  const location = useLocation()
  const resumen = (location.state as ConsultaLocationState | null)?.resumen
  const idAbonado = Number(id)

  const [abonado, setAbonado] = useState<AbonadoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(idAbonado) || idAbonado <= 0) {
      setError('Identificador de abonado inválido.')
      setLoading(false)
      return
    }

    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getAbonadoById(idAbonado)
        if (active) {
          setAbonado(response)
        }
      } catch (loadError) {
        if (active) {
          setAbonado(null)
          setError(
            loadError instanceof Error
              ? loadError.message.replace(/^HTTP \d+:\s*/, '')
              : 'No fue posible consultar el abonado.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [idAbonado])

  const servicioNis = resumen?.nis
  const servicioMedidor = resumen?.medidor

  return (
    <main className="gallery-admin" aria-labelledby="abonados-consulta-title">
      <header className="gallery-admin__header">
        <div>
          <h1 id="abonados-consulta-title">Gestión de abonados</h1>
          <p>Consulta del registro del abonado.</p>
        </div>
        <Link className="gallery-admin__link" to="/admin/abonados">
          Volver al listado
        </Link>
      </header>

      {loading ? (
        <p className="gallery-admin__empty" role="status">
          Cargando abonado…
        </p>
      ) : null}

      {error ? (
        <p className="gallery-admin__banner gallery-admin__banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && abonado ? (
        <section className="gallery-admin__form" aria-labelledby="abonado-detalle-title">
          <h2 id="abonado-detalle-title">
            {abonado.nombre} {abonado.apellidos}
          </h2>

          <h3>Datos personales</h3>
          <dl className="gallery-admin__summary">
            <div className="gallery-admin__summary-item">
              <dt>ID abonado</dt>
              <dd>{abonado.idAbonado}</dd>
            </div>
            <div className="gallery-admin__summary-item">
              <dt>Cédula</dt>
              <dd>{abonado.cedula}</dd>
            </div>
            <div className="gallery-admin__summary-item">
              <dt>Teléfono</dt>
              <dd>{abonado.telefono}</dd>
            </div>
            <div className="gallery-admin__summary-item">
              <dt>Correo</dt>
              <dd>{abonado.correo}</dd>
            </div>
            <div className="gallery-admin__summary-item">
              <dt>Dirección</dt>
              <dd>{abonado.direccion}</dd>
            </div>
          </dl>

          {servicioNis || servicioMedidor ? (
            <>
              <h3>Datos del servicio</h3>
              <dl className="gallery-admin__summary">
                {servicioNis ? (
                  <div className="gallery-admin__summary-item">
                    <dt>NIS</dt>
                    <dd>{servicioNis}</dd>
                  </div>
                ) : null}
                {servicioMedidor ? (
                  <div className="gallery-admin__summary-item">
                    <dt>Medidor</dt>
                    <dd>{servicioMedidor}</dd>
                  </div>
                ) : null}
              </dl>
            </>
          ) : null}

          <div className="gallery-admin__form-actions">
            <Link className="gallery-admin__button" to="/admin/abonados/nuevo">
              Registrar otro abonado
            </Link>
            <Link className="gallery-admin__link" to="/admin/abonados">
              Volver al listado
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  )
}

export default AbonadoConsultaPage
