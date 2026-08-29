import { useEffect } from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import Footer from '../components/Footer'
import { LANDING_SECTIONS } from '../config/landingSections'

const LandingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  return (
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
}

export default LandingPage

