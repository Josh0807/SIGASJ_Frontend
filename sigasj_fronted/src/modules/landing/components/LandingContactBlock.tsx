import ContactSection from './ContactSection'
import ReceiptPaymentSection from './ReceiptPaymentSection'
import { usePublicContact } from '../../contacto/hooks/usePublicContact'

const LandingContactBlock = () => {
  const { contacto, loading, error } = usePublicContact()

  return (
    <section className="landing-hub" aria-labelledby="landing-hub-title">
      <div className="landing-hub__shell">
        <header className="landing-section__heading landing-section__heading--hub">
          <p className="landing-eyebrow">Atención al abonado</p>
          <h2 id="landing-hub-title">Contacto, ubicación y pagos</h2>
          <p className="landing-section__lead">
            Comunícate con la ASADA, ubica nuestra oficina y consulta las formas de pago
            disponibles para tu servicio de agua.
          </p>
        </header>

        {error ? (
          <p className="landing-hub__notice" role="status">
            {error}
          </p>
        ) : null}

        <div className="landing-hub__contact">
          <ContactSection
            layout="hub"
            id="contacto"
            title="Contacto"
            description={
              contacto.descripcionContacto ??
              'Estamos para atenderte con información, orientación y atención a tus solicitudes.'
            }
            phonePrimary={contacto.telefono}
            phoneNumbers={
              contacto.telefonosAdicionales.length > 0
                ? contacto.telefonosAdicionales
                : undefined
            }
            email={contacto.email}
            attentionHours={contacto.horarioAtencion}
            address={contacto.direccion}
            locationReference={contacto.referenciaUbicacion ?? undefined}
            mapUrl={contacto.mapaUrl ?? undefined}
            mapLatitude={contacto.mapaLatitud ?? undefined}
            mapLongitude={contacto.mapaLongitud ?? undefined}
            mapZoom={contacto.mapaZoom}
            mapDescription={contacto.textoUbicacionMapa ?? undefined}
            loading={loading}
          />
        </div>

        <ReceiptPaymentSection
          layout="hub"
          telefono={contacto.telefono}
          ventanillaHours={contacto.horarioVentanilla ?? contacto.horarioAtencion}
        />
      </div>
    </section>
  )
}

export default LandingContactBlock
