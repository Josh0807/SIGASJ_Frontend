import ContactSection from './ContactSection'
import { usePublicContacto } from '../hooks/usePublicContacto'

/** Bloque de contacto sin recibos/pagos (estos viven en su propia sección). */
const ContactOnlyBlock = () => {
  const { contacto } = usePublicContacto()

  return (
    <ContactSection
      id="contacto"
      title="Contacto"
      phonePrimary={contacto.telefono}
      email={contacto.email}
      attentionHours={contacto.horarioAtencion}
      address={contacto.direccion}
      locationReference={contacto.referenciaUbicacion || undefined}
      mapUrl={contacto.mapaUrl}
      mapLatitude={contacto.latitud}
      mapLongitude={contacto.longitud}
      mapZoom={contacto.zoomMapa}
    />
  )
}

export default ContactOnlyBlock
