import { Fragment } from 'react'
import Header from './Header'
import HeroSection from './HeroSection'
import Footer from './Footer'
import ContactSection from './ContactSection'
import ReceiptPaymentSection from './ReceiptPaymentSection'
import AnnouncementsSection from './AnnouncementsSection'
import GallerySection from './GallerySection'
import AccountSection from './AccountSection'
import RequestsSection from './RequestsSection'
import AboutSection from './AboutSection'

const sections = [
  { id: 'sobre-nosotros', title: 'Sobre nosotros' },
  { id: 'comunicados', title: 'Comunicados' },
  { id: 'solicitudes-servicio', title: 'Solicitudes de servicio' },
  { id: 'reporte-averias', title: 'Reporte de averías' },
  { id: 'galeria', title: 'Galería' },
  { id: 'contacto', title: 'Contacto' },
]

const LandingPage = () => (
  <>
    <Header />
    <main>
      <HeroSection />

      {sections.map(({ id, title }) => {
        if (id === 'sobre-nosotros') {
          return <AboutSection key={id} />
        }

        if (id === 'comunicados') {
          return <AnnouncementsSection key={id} />
        }

        if (id === 'reporte-averias') {
          return <AccountSection key={id} />
        }

        if (id === 'solicitudes-servicio') {
          return <RequestsSection key={id} />
        }

        if (id === 'galeria') {
          return <GallerySection key={id} />
        }

        if (id === 'contacto') {
          return (
            <Fragment key={id}>
              <ReceiptPaymentSection />
              <ContactSection
                id={id}
                title={title}
                mapUrl="https://maps.app.goo.gl/2HtJjfvjTuLqVaFEA"
              />
            </Fragment>
          )
        }

        return (
          <section className="landing-section" id={id} key={id} aria-labelledby={`${id}-title`}>
            <h2 id={`${id}-title`}>{title}</h2>
            <p>Próximamente encontrarás aquí la información de esta sección.</p>
          </section>
        )
      })}
    </main>
    <Footer />
  </>
)

export default LandingPage
