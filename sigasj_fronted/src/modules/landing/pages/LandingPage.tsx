import { Suspense, useLayoutEffect } from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import Footer from '../components/Footer'
import { LANDING_SECTIONS } from '../config/landingSections'

const SectionFallback = ({ id }: { id: string }) => (
  <section
    id={id}
    className="mx-auto w-[min(calc(100%-3rem),1180px)] py-16"
    aria-busy="true"
  >
    <p className="m-0 text-slate-500" role="status">
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

  return (
    <>
      <Header />
      <main className="w-full min-w-0 overflow-x-hidden">
        <HeroSection />

        {LANDING_SECTIONS.map(({ id, Component }) => (
          <Suspense key={id} fallback={<SectionFallback id={id} />}>
            <Component />
          </Suspense>
        ))}
      </main>
      <Footer />
    </>
  )
}

export default LandingPage
