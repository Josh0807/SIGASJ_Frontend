import { IconArrowRight, IconDroplet, IconNews, IconTool } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import heroImage from '../../../assets/Hero1.png'
import type { HeroSectionProps } from '../types/HeroSectionProps'
import { ANNOUNCEMENTS_HREF } from '../config/landingAnchors'
import { REPORTAR_AVERIA_ROUTE_PATH } from '../../../app/router/routePaths'

const REPORT_FAULTS_HREF = REPORTAR_AVERIA_ROUTE_PATH

const HeroSection = ({
  id = 'inicio',
  title = 'SIGASJ – Sistema de Gestión del Acueducto de ASADA San Juan',
  description = 'Una plataforma diseñada para acercar los servicios de la ASADA San Juan a nuestra comunidad, facilitando el acceso a información, comunicados y servicios importantes.',
  imageSrc = heroImage,
  reportLabel = 'Reportar una avería',
  reportHref = REPORT_FAULTS_HREF,
  announcementsLabel = 'Ver comunicados',
  announcementsHref = ANNOUNCEMENTS_HREF,
}: HeroSectionProps) => (
  <section
    data-ui="hero"
    className="relative isolate flex min-h-[max(680px,calc(100svh-100px))] w-full min-w-0 items-center overflow-hidden bg-[#09365f] bg-cover bg-center text-white max-[640px]:min-h-[calc(100svh-86px)]"
    id={id}
    aria-labelledby="hero-title"
    style={{ backgroundImage: `url(${imageSrc})` }}
  >
    <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,35,65,0.91)_0%,rgba(7,55,94,0.77)_43%,rgba(4,42,76,0.42)_100%)]" aria-hidden="true" />

    <div className="mx-auto w-[min(calc(100%-3rem),1180px)] py-12 max-[520px]:w-[calc(100%-2rem)] max-[520px]:py-8">
      <div className="-translate-x-6 max-w-[700px] rounded-[22px] border border-sky-200/25 bg-[#082f55]/25 px-8 py-8 shadow-[0_20px_60px_rgba(2,28,52,0.18)] backdrop-blur-[2px] max-[760px]:translate-x-0 max-[760px]:rounded-2xl max-[760px]:px-6 max-[760px]:py-7 max-[520px]:border-0 max-[520px]:bg-transparent max-[520px]:px-0 max-[520px]:shadow-none max-[520px]:backdrop-blur-none">
        <p className="mb-4 flex items-center gap-4 text-[0.78rem] font-extrabold uppercase tracking-[0.24em] text-sky-200 before:h-0.5 before:w-8 before:rounded-full before:bg-sky-300 max-[520px]:gap-3 max-[520px]:text-[0.68rem] max-[520px]:tracking-[0.18em]">ASADA San Juan de Santa Cruz</p>
        <h1 id="hero-title" className="m-0 max-w-[18ch] text-[clamp(1.85rem,4.2vw,3rem)] font-extrabold leading-[1.12] tracking-[-0.02em] text-white [text-shadow:0_3px_12px_rgba(0,0,0,0.32)] max-[520px]:text-[clamp(1.7rem,8vw,2.15rem)]">{title}</h1>
        <p className="mt-5 max-w-[46rem] text-[clamp(1rem,1.5vw,1.125rem)] font-medium leading-[1.65] text-slate-50 [text-shadow:0_2px_8px_rgba(0,0,0,0.28)] max-[520px]:mt-4 max-[520px]:text-[0.95rem]">{description}</p>

        <nav className="mt-7 flex flex-wrap gap-3 max-[680px]:flex-col" aria-label="Acciones principales">
          <Link className="group flex min-h-12 min-w-[250px] items-center justify-center gap-3 rounded-xl border border-sky-300/70 bg-gradient-to-b from-[#35a3f7] to-[#0877e5] px-5 text-sm font-bold text-white no-underline shadow-[0_10px_22px_rgba(0,91,190,0.34)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(0,91,190,0.42)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-sky-300 max-[680px]:min-w-0 max-[680px]:w-full" to={reportHref}>
            <IconTool size={22} stroke={2.5} aria-hidden="true" />
            <span>{reportLabel}</span>
            <IconArrowRight className="transition-transform group-hover:translate-x-1" size={20} aria-hidden="true" />
          </Link>
          <a className="group flex min-h-12 min-w-[230px] items-center justify-center gap-3 rounded-xl border border-sky-100/90 bg-[#0a3b65]/35 px-5 text-sm font-bold text-white no-underline shadow-[0_8px_20px_rgba(0,20,40,0.12)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-sky-300 max-[680px]:min-w-0 max-[680px]:w-full" href={announcementsHref}>
            <IconNews size={22} stroke={2.2} aria-hidden="true" />
            <span>{announcementsLabel}</span>
            <IconArrowRight className="transition-transform group-hover:translate-x-1" size={20} aria-hidden="true" />
          </a>
        </nav>

        <p className="mt-7 flex items-center gap-4 text-[0.66rem] font-extrabold uppercase tracking-[0.3em] text-sky-200 max-[520px]:gap-3 max-[520px]:tracking-[0.18em]">
          <IconDroplet className="fill-sky-300 text-sky-300" size={22} aria-hidden="true" />
          <span>Agua para un mejor mañana</span>
          <span className="h-0.5 w-14 bg-sky-400" aria-hidden="true" />
        </p>
      </div>
    </div>

    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 overflow-hidden max-[520px]:h-14" aria-hidden="true">
      <div className="absolute -bottom-12 -left-[5%] h-24 w-[110%] rotate-[1.5deg] rounded-[50%_50%_0_0/70%_70%_0_0] bg-sky-400/35" />
      <div className="absolute -bottom-14 -left-[4%] h-24 w-[108%] -rotate-[1deg] rounded-[50%_50%_0_0/80%_80%_0_0] bg-sky-200/70" />
      <div className="absolute -bottom-16 -left-[3%] h-24 w-[106%] rotate-[0.5deg] rounded-[50%_50%_0_0/75%_75%_0_0] bg-white/90" />
    </div>
  </section>
)

export default HeroSection
