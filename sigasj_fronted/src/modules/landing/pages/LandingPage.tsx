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
    document.body.classList.add('landing-page-white')
    return () => {
      document.body.classList.remove('landing-page-white')
    }
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    AOS.init({
      duration: 650,
      easing: 'ease-out-cubic',
      once: true,
      offset: 40,
      anchorPlacement: 'top-bottom',
      disable: reduceMotion,
    })

    let refreshTimer: number | undefined
    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => {
        AOS.refreshHard()
      }, 60)
    }

    scheduleRefresh()
    window.addEventListener('load', scheduleRefresh)

    const main = document.querySelector('main')
    const observer =
      main && typeof MutationObserver !== 'undefined'
        ? new MutationObserver(scheduleRefresh)
        : null
    observer?.observe(main!, { childList: true, subtree: true })

    return () => {
      window.clearTimeout(refreshTimer)
      window.removeEventListener('load', scheduleRefresh)
      observer?.disconnect()
    }
  }, [])

  return (
    <div className="landing-page min-h-svh bg-white">
      <Header />
      <main className="w-full min-w-0 overflow-x-clip bg-white">
        <HeroSection />

        {LANDING_SECTIONS.map(({ id, Component }) => (
          <Suspense key={id} fallback={<SectionFallback id={id} />}>
            <Component />
          </Suspense>
        ))}
      </main>
      <Footer />
      <PublicAssistantBot />
    </div>
  )
}

export default LandingPage
