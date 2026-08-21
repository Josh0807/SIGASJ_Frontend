import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  formatCoordinate,
  geocodeAddressQuery,
  parseCoordinatesFromMapsUrl,
} from './mapLocationUtils'
import {
  hasContactoFormErrors,
  validateContactoFormValues,
  type ContactoFormErrors,
} from './contactoFormValidation'
import ContactAdminPreview from './ContactAdminPreview'
import {
  contactoToFormValues,
  whatsappHrefFromPhone,
  type ContactoFormValues,
  type ContactoPublico,
} from '../types/contacto.types'

type ContactAdminFormProps = {
  initialContacto: ContactoPublico
  submitting: boolean
  onSubmit: (values: ContactoFormValues) => Promise<void>
  onDirtyChange?: (dirty: boolean) => void
}

type FieldProps = {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}

const ContactField = ({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  children,
}: FieldProps) => (
  <div
    className={`contact-admin__field${error ? ' contact-admin__field--error' : ''}`}
  >
    <label htmlFor={htmlFor}>
      {label}
      {required ? <span className="contact-admin__required">*</span> : null}
    </label>
    {children}
    {hint ? <small>{hint}</small> : null}
    {error ? <p className="contact-admin__field-error">{error}</p> : null}
  </div>
)

const ContactAdminForm = ({
  initialContacto,
  submitting,
  onSubmit,
  onDirtyChange,
}: ContactAdminFormProps) => {
  const baselineValues = useMemo(
    () => contactoToFormValues(initialContacto),
    [initialContacto],
  )
  const [values, setValues] = useState<ContactoFormValues>(baselineValues)
  const [errors, setErrors] = useState<ContactoFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [locationMessage, setLocationMessage] = useState<string | null>(null)
  const [locationMessageTone, setLocationMessageTone] = useState<
    'success' | 'error' | 'info'
  >('info')

  useEffect(() => {
    setValues(baselineValues)
    setErrors({})
    setFormError(null)
  }, [baselineValues])

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(baselineValues),
    [values, baselineValues],
  )

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const handleChange = (field: keyof ContactoFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })
    setFormError(null)
  }

  const handleDiscard = () => {
    setValues(baselineValues)
    setErrors({})
    setFormError(null)
    setLocationMessage(null)
  }

  const applyMapCoordinates = (
    latitude: number,
    longitude: number,
    options?: { zoom?: number; message: string },
  ) => {
    setValues((current) => ({
      ...current,
      mapaLatitud: formatCoordinate(latitude),
      mapaLongitud: formatCoordinate(longitude),
      mapaZoom:
        options?.zoom !== undefined ? String(options.zoom) : current.mapaZoom,
    }))
    setErrors((current) => {
      const next = { ...current }
      delete next.mapaLatitud
      delete next.mapaLongitud
      delete next.mapaZoom
      return next
    })
    setLocationMessage(options?.message ?? 'Ubicación del mapa actualizada.')
    setLocationMessageTone('success')
  }

  const handleExtractFromMapsLink = () => {
    const link = values.mapaUrl.trim()
    if (!link) {
      setLocationMessage('Pega primero el enlace de Google Maps.')
      setLocationMessageTone('error')
      return
    }

    const parsed = parseCoordinatesFromMapsUrl(link)
    if (!parsed) {
      setLocationMessage(
        'No pudimos leer coordenadas de ese enlace. Abre el enlace en el navegador, copia la URL completa (con @lat,lng) e inténtalo otra vez.',
      )
      setLocationMessageTone('error')
      return
    }

    applyMapCoordinates(parsed.latitude, parsed.longitude, {
      zoom: parsed.zoom,
      message: 'Coordenadas extraídas del enlace de Google Maps.',
    })
  }

  const handleGeocodeFromAddress = async () => {
    const searchQuery = [
      values.direccion,
      values.referenciaUbicacion,
      values.regionResumen,
    ]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(', ')

    if (!searchQuery) {
      setLocationMessage('Completa la dirección física antes de buscar en el mapa.')
      setLocationMessageTone('error')
      return
    }

    setGeocoding(true)
    setLocationMessage('Buscando ubicación…')
    setLocationMessageTone('info')

    try {
      const result = await geocodeAddressQuery(searchQuery)
      if (!result) {
        setLocationMessage(
          'No encontramos esa dirección. Revisa el texto o usa el enlace de Google Maps.',
        )
        setLocationMessageTone('error')
        return
      }

      applyMapCoordinates(result.latitude, result.longitude, {
        message: `Ubicación encontrada: ${result.displayName}`,
      })
    } catch {
      setLocationMessage(
        'No fue posible buscar la dirección en este momento. Usa el enlace de Google Maps.',
      )
      setLocationMessageTone('error')
    } finally {
      setGeocoding(false)
    }
  }

  const hasMapCoordinates = Boolean(
    values.mapaLatitud.trim() && values.mapaLongitud.trim(),
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const nextErrors = validateContactoFormValues(values)
    setErrors(nextErrors)

    if (hasContactoFormErrors(nextErrors)) {
      setFormError('Revisa los campos marcados antes de guardar.')
      return
    }

    try {
      await onSubmit(values)
    } catch {
      setFormError('No fue posible guardar los cambios. Intenta de nuevo.')
    }
  }

  return (
    <>
      <div className="contact-admin__workspace">
        <form
          id="contact-admin-form"
          className="contact-admin__form"
          onSubmit={handleSubmit}
          noValidate
        >
          {formError ? (
            <div className="contact-admin__form-banner" role="alert">
              {formError}
            </div>
          ) : null}

          <section className="contact-admin__section contact-admin__section--contact">
            <header className="contact-admin__section-head">
              <span className="contact-admin__section-badge">1</span>
              <div>
                <h2>Datos de contacto</h2>
                <p>Teléfono, correo y horarios visibles en la landing y el footer.</p>
              </div>
            </header>

            <div className="contact-admin__fields">
              <ContactField
                label="Teléfono principal"
                htmlFor="contacto-telefono"
                hint="Formato sugerido: 8560-7584. WhatsApp, llamadas y SINPE usan este número."
                error={errors.telefono}
                required
              >
                <input
                  id="contacto-telefono"
                  value={values.telefono}
                  onChange={(event) => handleChange('telefono', event.target.value)}
                  placeholder="8560-7584"
                  autoComplete="tel"
                />
                {values.telefono.trim() ? (
                  <p className="contact-admin__whatsapp-preview">
                    Enlace WhatsApp generado:{' '}
                    <a
                      href={whatsappHrefFromPhone(values.telefono)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir vista previa del chat
                    </a>
                  </p>
                ) : null}
              </ContactField>

              <ContactField
                label="Teléfonos adicionales"
                htmlFor="contacto-telefonos-adicionales"
                hint="Un número por línea. Aparecen en la sección de contacto."
              >
                <textarea
                  id="contacto-telefonos-adicionales"
                  value={values.telefonosAdicionalesText}
                  onChange={(event) =>
                    handleChange('telefonosAdicionalesText', event.target.value)
                  }
                  rows={3}
                  placeholder={'8888-8888\n2222-3333'}
                />
              </ContactField>

              <div className="contact-admin__field-row">
                <ContactField
                  label="Correo electrónico"
                  htmlFor="contacto-email"
                  error={errors.email}
                  required
                >
                  <input
                    id="contacto-email"
                    type="email"
                    value={values.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    placeholder="asadasanjuan24@gmail.com"
                    autoComplete="email"
                  />
                </ContactField>

                <ContactField
                  label="Horario de atención"
                  htmlFor="contacto-horario"
                  error={errors.horarioAtencion}
                  required
                >
                  <input
                    id="contacto-horario"
                    value={values.horarioAtencion}
                    onChange={(event) =>
                      handleChange('horarioAtencion', event.target.value)
                    }
                    placeholder="Lunes a sábado de 7:30 a.m. – 11:30 a.m."
                  />
                </ContactField>
              </div>

              <ContactField
                label="Horario de ventanilla"
                htmlFor="contacto-ventanilla"
                hint="Opcional. Se muestra en la sección de métodos de pago."
              >
                <input
                  id="contacto-ventanilla"
                  value={values.horarioVentanilla}
                  onChange={(event) =>
                    handleChange('horarioVentanilla', event.target.value)
                  }
                  placeholder="Igual que horario de atención si se deja vacío"
                />
              </ContactField>

              <ContactField
                label="Descripción del bloque de contacto"
                htmlFor="contacto-descripcion"
                hint="Texto introductorio bajo el título «Contacto» en la landing."
              >
                <textarea
                  id="contacto-descripcion"
                  value={values.descripcionContacto}
                  onChange={(event) =>
                    handleChange('descripcionContacto', event.target.value)
                  }
                  rows={3}
                  placeholder="Estamos para atenderte con información y orientación."
                />
              </ContactField>
            </div>
          </section>

          <section className="contact-admin__section contact-admin__section--location">
            <header className="contact-admin__section-head">
              <span className="contact-admin__section-badge">2</span>
              <div>
                <h2>Ubicación y mapa</h2>
                <p>Dirección física, referencias y coordenadas para el mapa embebido.</p>
              </div>
            </header>

            <div className="contact-admin__fields">
              <ContactField
                label="Dirección física"
                htmlFor="contacto-direccion"
                error={errors.direccion}
                required
              >
                <textarea
                  id="contacto-direccion"
                  value={values.direccion}
                  onChange={(event) => handleChange('direccion', event.target.value)}
                  rows={2}
                  placeholder="Costado norte de la Plaza de Deportes, San Juan, Santa Cruz."
                />
              </ContactField>

              <div className="contact-admin__field-row">
                <ContactField
                  label="Referencia de ubicación"
                  htmlFor="contacto-referencia"
                  hint="Opcional. Ej: Frente al parque."
                >
                  <input
                    id="contacto-referencia"
                    value={values.referenciaUbicacion}
                    onChange={(event) =>
                      handleChange('referenciaUbicacion', event.target.value)
                    }
                  />
                </ContactField>

                <ContactField
                  label="Resumen regional (footer)"
                  htmlFor="contacto-region"
                  error={errors.regionResumen}
                  required
                >
                  <input
                    id="contacto-region"
                    value={values.regionResumen}
                    onChange={(event) =>
                      handleChange('regionResumen', event.target.value)
                    }
                    placeholder="San Juan de Santa Cruz, Guanacaste"
                  />
                </ContactField>
              </div>

              <div className="contact-admin__location-easy">
                <div className="contact-admin__location-easy-head">
                  <h3>Ubicar en el mapa (modo fácil)</h3>
                  <p>No necesitas escribir latitud ni longitud manualmente.</p>
                </div>

                <ol className="contact-admin__location-steps">
                  <li>Abre <strong>Google Maps</strong> en el celular o computadora.</li>
                  <li>Busca la oficina de la ASADA y pulsa <strong>Compartir</strong>.</li>
                  <li>Copia el enlace y pégalo abajo, luego pulsa <strong>Usar enlace</strong>.</li>
                </ol>

                <ContactField
                  label="Enlace de Google Maps"
                  htmlFor="contacto-mapa-url"
                  hint="Pega el enlace compartido. Si es corto (goo.gl), ábrelo antes y copia la URL completa del navegador."
                  error={errors.mapaUrl}
                >
                  <div className="contact-admin__location-link-row">
                    <input
                      id="contacto-mapa-url"
                      type="url"
                      value={values.mapaUrl}
                      onChange={(event) => handleChange('mapaUrl', event.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                    />
                    <button
                      type="button"
                      className="contact-admin__button contact-admin__button--primary"
                      onClick={handleExtractFromMapsLink}
                    >
                      Usar enlace
                    </button>
                  </div>
                </ContactField>

                <div className="contact-admin__location-divider" aria-hidden="true">
                  <span>o</span>
                </div>

                <div className="contact-admin__location-geocode">
                  <p>
                    También puedes ubicar automáticamente a partir de la dirección que
                    escribiste arriba.
                  </p>
                  <button
                    type="button"
                    className="contact-admin__button contact-admin__button--ghost"
                    onClick={() => void handleGeocodeFromAddress()}
                    disabled={geocoding || !values.direccion.trim()}
                  >
                    {geocoding ? 'Buscando…' : 'Buscar ubicación desde la dirección'}
                  </button>
                </div>

                {locationMessage ? (
                  <p
                    className={`contact-admin__location-message contact-admin__location-message--${locationMessageTone}`}
                    role="status"
                  >
                    {locationMessage}
                  </p>
                ) : null}

                {hasMapCoordinates ? (
                  <p className="contact-admin__location-status">
                    Mapa configurado en{' '}
                    <strong>
                      {values.mapaLatitud}, {values.mapaLongitud}
                    </strong>
                    {values.mapaZoom.trim() ? ` · zoom ${values.mapaZoom}` : null}
                  </p>
                ) : (
                  <p className="contact-admin__location-status contact-admin__location-status--pending">
                    Aún no hay coordenadas. Usa uno de los métodos de arriba y revisa la
                    vista previa a la derecha.
                  </p>
                )}
              </div>

              <ContactField
                label="Texto del mapa"
                htmlFor="contacto-mapa-texto"
                hint="Descripción corta junto al mapa en la landing."
              >
                <input
                  id="contacto-mapa-texto"
                  value={values.textoUbicacionMapa}
                  onChange={(event) =>
                    handleChange('textoUbicacionMapa', event.target.value)
                  }
                  placeholder="Encuentra nuestra oficina en San Juan de Santa Cruz."
                />
              </ContactField>

              <details className="contact-admin__location-advanced">
                <summary>Ajuste manual de coordenadas (opcional)</summary>
                <div className="contact-admin__coords">
                  <ContactField
                    label="Latitud"
                    htmlFor="contacto-lat"
                    error={errors.mapaLatitud}
                    hint="Ej: 10.2188017"
                  >
                    <input
                      id="contacto-lat"
                      inputMode="decimal"
                      value={values.mapaLatitud}
                      onChange={(event) =>
                        handleChange('mapaLatitud', event.target.value)
                      }
                    />
                  </ContactField>

                  <ContactField
                    label="Longitud"
                    htmlFor="contacto-lng"
                    error={errors.mapaLongitud}
                    hint="Ej: -85.5565018"
                  >
                    <input
                      id="contacto-lng"
                      inputMode="decimal"
                      value={values.mapaLongitud}
                      onChange={(event) =>
                        handleChange('mapaLongitud', event.target.value)
                      }
                    />
                  </ContactField>

                  <ContactField
                    label="Zoom del mapa"
                    htmlFor="contacto-zoom"
                    error={errors.mapaZoom}
                    hint="Entre 1 y 21"
                  >
                    <input
                      id="contacto-zoom"
                      type="number"
                      min={1}
                      max={21}
                      value={values.mapaZoom}
                      onChange={(event) => handleChange('mapaZoom', event.target.value)}
                    />
                  </ContactField>
                </div>
              </details>
            </div>
          </section>

          <section className="contact-admin__section contact-admin__section--social">
            <header className="contact-admin__section-head">
              <span className="contact-admin__section-badge">3</span>
              <div>
                <h2>Redes sociales</h2>
                <p>Enlaces que aparecen en el footer de la landing.</p>
              </div>
            </header>

            <ContactField
              label="URL de Facebook"
              htmlFor="contacto-facebook"
              error={errors.urlFacebook}
              hint="Opcional. Debe comenzar con https://"
            >
              <input
                id="contacto-facebook"
                type="url"
                value={values.urlFacebook}
                onChange={(event) => handleChange('urlFacebook', event.target.value)}
                placeholder="https://www.facebook.com/..."
              />
            </ContactField>
          </section>

          <div className="contact-admin__actions">
            <button
              type="button"
              className="contact-admin__button contact-admin__button--ghost"
              onClick={handleDiscard}
              disabled={submitting || !isDirty}
            >
              Descartar cambios
            </button>
            <button
              type="submit"
              className="contact-admin__button contact-admin__button--primary"
              disabled={submitting || !isDirty}
            >
              {submitting ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>

        <ContactAdminPreview values={values} />
      </div>

      {isDirty ? (
        <div className="contact-admin__sticky-bar" role="region" aria-label="Cambios pendientes">
          <p>Tienes cambios sin guardar</p>
          <div className="contact-admin__sticky-actions">
            <button
              type="button"
              className="contact-admin__button contact-admin__button--ghost"
              onClick={handleDiscard}
              disabled={submitting}
            >
              Descartar
            </button>
            <button
              type="submit"
              form="contact-admin-form"
              className="contact-admin__button contact-admin__button--primary"
              disabled={submitting}
            >
              {submitting ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default ContactAdminForm
