import ContactSection from './ContactSection'
import ReceiptPaymentSection from './ReceiptPaymentSection'

const CONTACT_MAP_URL = 'https://maps.app.goo.gl/2HtJjfvjTuLqVaFEA'
const CONTACT_MAP_LATITUDE = 10.2188017
const CONTACT_MAP_LONGITUDE = -85.5565018

const LandingContactBlock = () => (
  <>
    <ReceiptPaymentSection />
    <ContactSection
      id="contacto"
      title="Contacto"
      mapUrl={CONTACT_MAP_URL}
      mapLatitude={CONTACT_MAP_LATITUDE}
      mapLongitude={CONTACT_MAP_LONGITUDE}
      mapZoom={19}
    />
  </>
)

export default LandingContactBlock
