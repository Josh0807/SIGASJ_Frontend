import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import Footer from '../components/Footer'
import LandingMobileBar from '../components/LandingMobileBar'
import { LANDING_SECTIONS } from '../config/landingSections'
import { PublicContactProvider } from '../../contacto/context/PublicContactContext'

const LandingPage = () => (
  <PublicContactProvider>
    <Header />
    <main>
      <HeroSection />

      {LANDING_SECTIONS.map(({ id, Component }) => (
        <Component key={id} />
      ))}
    </main>
    <Footer />
    <LandingMobileBar />
  </PublicContactProvider>
)

export default LandingPage
