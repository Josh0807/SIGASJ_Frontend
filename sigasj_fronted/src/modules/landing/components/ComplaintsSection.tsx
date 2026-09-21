import { IconArrowRight, IconMail } from '@tabler/icons-react'
import { Link } from 'react-router-dom'

const ComplaintsSection = () => (
  <section
    className="sigasj-action-section sigasj-action-section--second relative isolate overflow-hidden"
    id="quejas"
    aria-labelledby="quejas-title"
  >
    <div className="pointer-events-none absolute -left-32 top-16 -z-10 h-56 w-[650px] rotate-[9deg] rounded-[50%] bg-sky-200/30" aria-hidden="true" />
    <div className="pointer-events-none absolute -right-40 top-0 -z-10 h-52 w-[620px] -rotate-12 rounded-[50%] bg-sky-200/28" aria-hidden="true" />
    <div className="pointer-events-none absolute -bottom-28 -left-20 -z-10 h-56 w-[920px] rotate-[7deg] rounded-[50%] bg-sky-200/40" aria-hidden="true" />
    <div className="pointer-events-none absolute -bottom-36 right-[-8%] -z-10 h-64 w-[980px] -rotate-5 rounded-[50%] border-[48px] border-white/50" aria-hidden="true" />

    <div className="sigasj-action-card relative">
      <div className="sigasj-action-icon relative z-10">
        <IconMail className="size-[clamp(40px,4vw,64px)]" stroke={2.1} aria-hidden="true" />
      </div>

      <div className="sigasj-action-copy relative z-10">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.28em] text-[#1476cf]">Atención al usuario</p>
        <h2 id="quejas-title" className="m-0 text-[clamp(2.2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.04em] text-[#092e67]">Sugerencias y Quejas</h2>
        <p className="mb-0 mt-4 max-w-[650px] text-base leading-7 text-[#526d8c]">
          Envíanos tus sugerencias y quejas completando el formulario para brindarte la atención correspondiente.
        </p>
      </div>

      <div className="sigasj-action-side relative z-10">
        <Link className="sigasj-action-button sigasj-action-button--wide" to="/formulario-quejas">
          Enviar sugerencia o queja <IconArrowRight size={23} aria-hidden="true" />
        </Link>
        <p className="m-0 text-[clamp(0.62rem,0.85vw,0.875rem)] leading-[1.45] text-[#657b96]">Haz clic para abrir el formulario en línea y enviarnos tus sugerencias y quejas.</p>
      </div>

      <span className="pointer-events-none absolute -bottom-20 -right-16 h-36 w-[430px] -rotate-6 rounded-[50%] bg-sky-100/75" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-24 -right-20 h-36 w-[470px] rotate-3 rounded-[50%] border-[24px] border-sky-200/35" aria-hidden="true" />
    </div>
  </section>
)

export default ComplaintsSection
