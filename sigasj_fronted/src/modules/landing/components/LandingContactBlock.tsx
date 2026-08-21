import ContactSection from './ContactSection'
import ReceiptPaymentSection from './ReceiptPaymentSection'
import { usePublicContacto } from '../hooks/usePublicContacto'

const LandingContactBlock = () => {
  const { contacto } = usePublicContacto()

  return (
    <>
      <ReceiptPaymentSection />
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
    </>
  )
}

export default LandingContactBlock
