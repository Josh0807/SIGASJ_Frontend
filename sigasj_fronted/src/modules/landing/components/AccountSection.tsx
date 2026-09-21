import { IconArrowRight, IconDropletExclamation } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { REPORTAR_AVERIA_ROUTE_PATH } from '../../../app/router/routePaths'
import type { AccountSectionProps } from '../types/AccountSectionProps'

const AccountSection = ({ formHref = REPORTAR_AVERIA_ROUTE_PATH }: AccountSectionProps) => (
  <section
    className="sigasj-action-section sigasj-action-section--first relative isolate overflow-hidden"
    id="reporte-averias"
    aria-labelledby="reporte-averias-title"
  >
    <div className="pointer-events-none absolute -left-32 -top-36 -z-10 h-64 w-[720px] rotate-[8deg] rounded-[50%] bg-sky-200/35" aria-hidden="true" />
    <div className="pointer-events-none absolute -right-40 top-12 -z-10 h-48 w-[620px] -rotate-12 rounded-[50%] bg-sky-200/30" aria-hidden="true" />
    <div className="pointer-events-none absolute bottom-[-105px] left-[16%] -z-10 h-44 w-[760px] -rotate-3 rounded-[50%] bg-sky-100/70" aria-hidden="true" />

    <div className="sigasj-action-card relative">
      <div className="sigasj-action-icon relative z-10">
        <IconDropletExclamation className="size-[clamp(40px,4vw,64px)]" stroke={1.8} aria-hidden="true" />
      </div>

      <div className="sigasj-action-copy relative z-10">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.28em] text-[#1476cf]">Atención de averías</p>
        <h2 id="reporte-averias-title" className="m-0 text-[clamp(2.2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.04em] text-[#092e67]">Reportar una avería</h2>
        <p className="mb-0 mt-4 max-w-[690px] text-base leading-7 text-[#526d8c]">
          Infórmanos sobre fugas, daños u otras averías en el servicio de agua para que podamos atenderlas oportunamente.
        </p>
      </div>

      <Link className="sigasj-action-button relative z-10" to={formHref}>
        Reportar avería <IconArrowRight size={23} aria-hidden="true" />
      </Link>

      <span className="pointer-events-none absolute -bottom-20 -right-16 h-36 w-[430px] -rotate-6 rounded-[50%] bg-sky-100/75" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-24 -right-20 h-36 w-[470px] rotate-3 rounded-[50%] border-[24px] border-sky-200/35" aria-hidden="true" />
    </div>
  </section>
)

export default AccountSection
