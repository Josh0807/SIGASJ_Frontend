import ContactSection from './ContactSection'
import ReceiptPaymentSection from './ReceiptPaymentSection'

const CONTACT_MAP_URL = 'https://maps.app.goo.gl/2HtJjfvjTuLqVaFEA'

const LandingContactBlock = () => (
  <>
    <ReceiptPaymentSection />
    <ContactSection
      id="contacto"
      title="Contacto"
      mapUrl={CONTACT_MAP_URL}
    />
  </>
)

export default LandingContactBlock
