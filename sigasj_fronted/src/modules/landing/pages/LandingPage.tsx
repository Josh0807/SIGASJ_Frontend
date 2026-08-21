import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import Footer from '../components/Footer'
import { LANDING_SECTIONS } from '../config/landingSections'

const LandingPage = () => (
  <>
    <Header />
    <main>
      <HeroSection />

      {LANDING_SECTIONS.map(({ id, Component }) => (
        <Component key={id} />
      ))}
    </main>
    <Footer />
  </>
)

export default LandingPage
