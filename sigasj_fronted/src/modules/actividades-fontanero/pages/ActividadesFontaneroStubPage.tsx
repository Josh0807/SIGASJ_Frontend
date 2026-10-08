import { Link } from 'react-router-dom'
import { IconArrowLeft } from '@tabler/icons-react'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'

type ActividadesFontaneroStubPageProps = {
  title: string
  description: string
  emptyMessage?: string
  backPath?: string
  backLabel?: string
}

const ActividadesFontaneroStubPage = ({
  title,
  description,
  emptyMessage,
  backPath = ACTIVIDADES_FONTANERO_PATHS.home,
  backLabel = 'Volver al menú de actividades',
}: ActividadesFontaneroStubPageProps) => (
  <section
    className="actividades-fontanero-stub !mx-0 !flex !max-w-none !flex-col !gap-7 !border-0 !bg-transparent !p-0 !shadow-none"
    aria-labelledby="actividades-fontanero-stub-title"
  >
    <header className="rounded-[28px] border border-blue-100 bg-gradient-to-br from-white to-sky-50/70 px-8 py-8 shadow-[0_14px_38px_rgba(30,90,156,0.10)] md:px-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <p className="!m-0 text-sm font-black uppercase tracking-[0.12em] text-blue-600">Registro de Actividades</p>
          <h1 id="actividades-fontanero-stub-title" className="!m-0 !text-3xl !font-black !tracking-tight !text-[#07376f] md:!text-4xl">{title}</h1>
          <p className="!m-0 text-lg leading-relaxed text-slate-500">{description}</p>
        </div>
        <Link to={backPath} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 font-bold !no-underline text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:bg-blue-50 hover:!no-underline focus:!no-underline">
          <IconArrowLeft size={20} aria-hidden="true" />
          {backLabel}
        </Link>
      </div>
    </header>
    {emptyMessage ? (
      <p className="actividades-fontanero-stub__empty" role="status">
        {emptyMessage}
      </p>
    ) : null}
  </section>
)

export default ActividadesFontaneroStubPage
