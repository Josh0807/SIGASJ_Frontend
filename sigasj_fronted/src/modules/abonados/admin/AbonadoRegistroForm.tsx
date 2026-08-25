import { type FormEvent, useEffect, useState } from 'react'
import {
  emptyAbonadoRegistroFormValues,
  type AbonadoRegistroFormValues,
} from './types'
import type { SolicitudPendiente } from '../services/abonadosApi'

type AbonadoRegistroFormProps = {
  solicitudes: SolicitudPendiente[]
  solicitudesMensaje: string | null
  loadingSolicitudes: boolean
  submitting?: boolean
  serverError?: string | null
  onSubmit: (values: AbonadoRegistroFormValues) => Promise<void>
  onCancel: () => void
}

const validate = (values: AbonadoRegistroFormValues): string | null => {
  if (values.origen === 'solicitud' && !values.idSolicitud) {
    return 'Seleccione una solicitud aprobada o registre manualmente.'
  }
  if (!values.nombre.trim()) return 'El nombre es obligatorio.'
  if (!values.apellidos.trim()) return 'Los apellidos son obligatorios.'
  if (!values.cedula.trim()) return 'La cédula es obligatoria.'
  if (!values.telefono.trim()) return 'El teléfono es obligatorio.'
  if (!values.correo.trim()) return 'El correo es obligatorio.'
  if (!values.direccion.trim()) return 'La dirección es obligatoria.'
  if (!values.servicio.nis.trim()) return 'El NIS es obligatorio.'
  if (!values.servicio.medidor.trim()) return 'El número de medidor es obligatorio.'
  if (!values.servicio.sector.trim()) return 'El sector es obligatorio.'
  if (!values.servicio.tarifa.trim()) return 'La tarifa es obligatoria.'
  if (!values.servicio.numeroPlano.trim()) return 'El número de plano es obligatorio.'
  return null
}

const AbonadoRegistroForm = ({
  solicitudes,
  solicitudesMensaje,
  loadingSolicitudes,
  submitting = false,
  serverError = null,
  onSubmit,
  onCancel,
}: AbonadoRegistroFormProps) => {
  const [values, setValues] = useState(emptyAbonadoRegistroFormValues())
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (values.origen !== 'solicitud' || !values.idSolicitud) {
      return
    }

    const solicitud = solicitudes.find(
      (item) => String(item.idSolicitud) === values.idSolicitud,
    )

    if (!solicitud) {
      return
    }

    setValues((current) => ({
      ...current,
      nombre: solicitud.nombre,
      apellidos: solicitud.apellidos,
      cedula: solicitud.cedula,
      telefono: solicitud.telefono,
      correo: solicitud.correo,
      direccion: solicitud.direccion,
    }))
  }, [values.origen, values.idSolicitud, solicitudes])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const validationError = validate(values)
    if (validationError) {
      setFormError(validationError)
      return
    }

    try {
      await onSubmit(values)
    } catch {
      // El contenedor muestra serverError del backend.
    }
  }

  return (
    <form className="gallery-admin__form" onSubmit={handleSubmit}>
      <h2>Registrar nuevo abonado</h2>

      <section className="gallery-admin__field">
        <span>Origen del registro</span>
        <label>
          <input
            type="radio"
            name="origen"
            checked={values.origen === 'manual'}
            onChange={() =>
              setValues((current) => ({
                ...current,
                origen: 'manual',
                idSolicitud: '',
              }))
            }
          />{' '}
          Ingreso manual
        </label>
        <label>
          <input
            type="radio"
            name="origen"
            checked={values.origen === 'solicitud'}
            onChange={() =>
              setValues((current) => ({ ...current, origen: 'solicitud' }))
            }
          />{' '}
          Desde solicitud aprobada
        </label>
      </section>

      {values.origen === 'solicitud' ? (
        <label className="gallery-admin__field">
          <span>Solicitud aprobada *</span>
          <select
            value={values.idSolicitud}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                idSolicitud: event.target.value,
              }))
            }
            disabled={loadingSolicitudes || solicitudes.length === 0}
          >
            <option value="">Seleccione una solicitud</option>
            {solicitudes.map((solicitud) => (
              <option key={solicitud.idSolicitud} value={solicitud.idSolicitud}>
                {solicitud.nombre} {solicitud.apellidos} — {solicitud.cedula}
              </option>
            ))}
          </select>
          {solicitudesMensaje ? <p>{solicitudesMensaje}</p> : null}
        </label>
      ) : null}

      <h3>Datos personales</h3>

      <label className="gallery-admin__field">
        <span>Nombre *</span>
        <input
          value={values.nombre}
          onChange={(event) =>
            setValues((current) => ({ ...current, nombre: event.target.value }))
          }
        />
      </label>

      <label className="gallery-admin__field">
        <span>Apellidos *</span>
        <input
          value={values.apellidos}
          onChange={(event) =>
            setValues((current) => ({ ...current, apellidos: event.target.value }))
          }
        />
      </label>

      <label className="gallery-admin__field">
        <span>Cédula *</span>
        <input
          value={values.cedula}
          onChange={(event) =>
            setValues((current) => ({ ...current, cedula: event.target.value }))
          }
        />
      </label>

      <label className="gallery-admin__field">
        <span>Teléfono *</span>
        <input
          value={values.telefono}
          onChange={(event) =>
            setValues((current) => ({ ...current, telefono: event.target.value }))
          }
        />
      </label>

      <label className="gallery-admin__field">
        <span>Correo *</span>
        <input
          type="email"
          value={values.correo}
          onChange={(event) =>
            setValues((current) => ({ ...current, correo: event.target.value }))
          }
        />
      </label>

      <label className="gallery-admin__field">
        <span>Dirección *</span>
        <input
          value={values.direccion}
          onChange={(event) =>
            setValues((current) => ({ ...current, direccion: event.target.value }))
          }
        />
      </label>

      <h3>Datos del servicio</h3>

      <label className="gallery-admin__field">
        <span>NIS *</span>
        <input
          value={values.servicio.nis}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              servicio: { ...current.servicio, nis: event.target.value },
            }))
          }
        />
      </label>

      <label className="gallery-admin__field">
        <span>Número de medidor *</span>
        <input
          value={values.servicio.medidor}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              servicio: { ...current.servicio, medidor: event.target.value },
            }))
          }
        />
      </label>

      <label className="gallery-admin__field">
        <span>Sector *</span>
        <input
          value={values.servicio.sector}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              servicio: { ...current.servicio, sector: event.target.value },
            }))
          }
        />
      </label>

      <label className="gallery-admin__field">
        <span>Tarifa *</span>
        <input
          value={values.servicio.tarifa}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              servicio: { ...current.servicio, tarifa: event.target.value },
            }))
          }
        />
      </label>

      <label className="gallery-admin__field">
        <span>Número de plano *</span>
        <input
          value={values.servicio.numeroPlano}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              servicio: { ...current.servicio, numeroPlano: event.target.value },
            }))
          }
        />
      </label>

      {formError ? <p className="gallery-admin__error">{formError}</p> : null}
      {serverError ? <p className="gallery-admin__error">{serverError}</p> : null}

      <div className="gallery-admin__actions">
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Registrar abonado'}
        </button>
      </div>
    </form>
  )
}

export default AbonadoRegistroForm
