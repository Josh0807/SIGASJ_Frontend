import Header from './Header'
import HeroSection from './HeroSection'
import Footer from './Footer'
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
