import { useEffect, useId, useLayoutEffect, type ReactNode } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Footer from './Footer'
import PublicReceiptNavbar from '../../recibos/components/PublicReceiptNavbar'

const MAX_WIDTH = {
  md: 'max-w-[850px]',
  lg: 'max-w-[920px]',
  xl: 'max-w-[1050px]',
} as const

export type PublicFormPageProps = {
  returnTo: string
  eyebrow: string
  title: string
  description?: ReactNode
  ariaLabel: string
  titleId?: string
  icon?: ReactNode
  /** Ancho del contenedor. Por defecto lg. */
  maxWidth?: keyof typeof MAX_WIDTH
  showFooter?: boolean
  /** Envuelve children en card institucional. */
  card?: boolean
  children: ReactNode
}

/**
 * Cascara compartida para páginas públicas (trámites, recibo, averías, quejas).
 * Tipografía, colores y movimiento alineados con el landing.
 */
const PublicFormPage = ({
  returnTo,
  eyebrow,
  title,
  description,
  ariaLabel,
  titleId: titleIdProp,
  icon,
  maxWidth = 'lg',
  showFooter = true,
  card = false,
  children,
}: PublicFormPageProps) => {
  const reactId = useId()
  const titleId = titleIdProp ?? `public-form-title-${reactId.replace(/:/g, '')}`

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  useEffect(() => {
    document.body.classList.add('landing-page-white')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    AOS.init({
      duration: 650,
      easing: 'ease-out-cubic',
      once: true,
      offset: 40,
      anchorPlacement: 'top-bottom',
      disable: reduceMotion,
    })
    AOS.refreshHard()
    return () => {
      document.body.classList.remove('landing-page-white')
    }
  }, [])

  return (
    <div className="public-form-page flex min-h-screen flex-col bg-white text-sigasj-ink">
      <PublicReceiptNavbar returnTo={returnTo} />

      <main
        className="public-form-page__main relative isolate flex-1 bg-white px-6 pb-16 pt-10 max-[640px]:px-4 max-[640px]:pb-12 max-[640px]:pt-8 max-[380px]:px-3"
        aria-label={ariaLabel}
        aria-labelledby={titleId}
      >
        <div className={`public-container mx-auto w-full ${MAX_WIDTH[maxWidth]}`}>
          <header className="mx-auto max-w-[760px] text-center" data-aos="fade-up">
            {icon ? (
              <span className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl border border-sigasj-border bg-sigasj-surface-soft text-sigasj-primary shadow-[0_8px_20px_rgba(39,112,166,0.1)]">
                {icon}
              </span>
            ) : null}
            <p className="public-eyebrow inline-block [margin-inline-end:-0.12em]">{eyebrow}</p>
            <h1 id={titleId} className="public-section-title mt-1 !text-[clamp(1.85rem,4.5vw,2.85rem)]">
              {title}
            </h1>
            {description ? (
              <p className="public-section-intro mx-auto mt-4 max-w-[36rem]">{description}</p>
            ) : null}
          </header>

          <div className="mt-9" data-aos="fade-up" data-aos-delay="80">
            {card ? (
              <section className="transparency-motion-card rounded-[16px] border border-sigasj-border bg-sigasj-surface p-7 shadow-[0_4px_14px_rgba(16,43,56,0.05)] max-[640px]:p-5">
                {children}
              </section>
            ) : (
              children
            )}
          </div>
        </div>
      </main>

      {showFooter ? <Footer /> : null}
    </div>
  )
}

export default PublicFormPage
