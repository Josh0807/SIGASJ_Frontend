import { Suspense, useEffect, useLayoutEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import Footer from '../components/Footer'
import PublicAssistantBot from '../assistant/PublicAssistantBot'
import { LANDING_SECTIONS } from '../config/landingSections'

const SectionFallback = ({ id }: { id: string }) => (
  <section
    id={id}
    className="mx-auto w-[min(calc(100%-3rem),1180px)] py-16"
    aria-busy="true"
  >
    <p className="m-0 text-sigasj-muted" role="status">
      Cargando sección…
    </p>
  </section>
)

const LandingPage = () => {
  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    const sectionId = decodeURIComponent(window.location.hash.slice(1))

    const placeAtDestination = () => {
      const section = sectionId ? document.getElementById(sectionId) : null
      const top = section ? Math.max(0, section.offsetTop - 86) : 0
      document.documentElement.scrollTop = top
      document.body.scrollTop = top
    }

    placeAtDestination()
    const frameId = window.requestAnimationFrame(placeAtDestination)
    const retryIds = [50, 200, 500].map((delay) =>
      window.setTimeout(placeAtDestination, delay),
    )

    return () => {
      window.cancelAnimationFrame(frameId)
      retryIds.forEach((id) => window.clearTimeout(id))
      window.history.scrollRestoration = previousScrollRestoration
    }
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
      disable: reduceMotion,
    })

    const refresh = () => AOS.refreshHard()
    const timer = window.setTimeout(refresh, 400)
    window.addEventListener('load', refresh)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <>
      <Header />
      <main className="w-full min-w-0 overflow-x-clip">
        <HeroSection />

        {LANDING_SECTIONS.map(({ id, Component }, index) => (
          <div
            key={id}
            data-aos="fade-up"
            data-aos-delay={Math.min(index * 40, 160)}
          >
            <Suspense fallback={<SectionFallback id={id} />}>
              <Component />
            </Suspense>
          </div>
        ))}
      </main>
      <Footer />
      <PublicAssistantBot />
    </>
  )
}

export default LandingPage
