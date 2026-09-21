import { useLayoutEffect } from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import Footer from '../components/Footer'
import { LANDING_SECTIONS } from '../config/landingSections'

const LandingPage = () => {
  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    const sectionId = decodeURIComponent(window.location.hash.slice(1))
    const section = sectionId ? document.getElementById(sectionId) : null
    const top = section ? Math.max(0, section.offsetTop - 86) : 0

    const placeAtDestination = () => {
      document.documentElement.scrollTop = top
      document.body.scrollTop = top
    }

    placeAtDestination()
    const frameId = window.requestAnimationFrame(placeAtDestination)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.history.scrollRestoration = previousScrollRestoration
    }
  }, [])

  return (
    <>
      <Header />
      <main className="w-full min-w-0 overflow-x-hidden">
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
