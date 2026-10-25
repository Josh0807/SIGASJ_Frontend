import { IconArrowUpRight, IconClipboardList, IconDownload, IconFiles, type Icon } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { FORMULARIOS_DESCARGABLES_ADMIN_PATH, FORMULARIOS_OFICIALES_ADMIN_PATH, SOLICITUDES_ADMIN_TRAMITES_PATH } from './solicitudesAdminPaths'

type AdminSection = { title: string; description: string; eyebrow: string; action: string; path: string; icon: Icon }

const sections: AdminSection[] = [
  { title: 'Trámites digitales', description: 'Revise las solicitudes ciudadanas, consulte sus datos y gestione cada cambio de estado.', eyebrow: 'Operación diaria', action: 'Gestionar solicitudes', path: SOLICITUDES_ADMIN_TRAMITES_PATH, icon: IconClipboardList },
  { title: 'Formularios oficiales', description: 'Mantenga vigente el PDF oficial asociado a cada uno de los seis trámites digitales.', eyebrow: 'Documentos por trámite', action: 'Administrar oficiales', path: FORMULARIOS_OFICIALES_ADMIN_PATH, icon: IconFiles },
  { title: 'Formularios descargables', description: 'Publique y organice documentos adicionales para la sección pública Otros formularios.', eyebrow: 'Biblioteca pública', action: 'Gestionar descargas', path: FORMULARIOS_DESCARGABLES_ADMIN_PATH, icon: IconDownload },
]

const SolicitudesAdminHomePage = () => (
  <main className="admin-content-modern min-w-0"><div className="mx-auto grid w-full max-w-[1180px] gap-8">
    <header className="min-h-[220px] rounded-[24px] border border-sky-100 bg-white p-8 shadow-[0_12px_32px_rgba(39,112,166,0.08)] max-[640px]:min-h-0 max-[640px]:p-6">
      <p className="m-0 text-sm font-extrabold uppercase tracking-[0.1em] text-blue-600">Administración · Solicitudes</p>
      <h1 className="mb-0 mt-5 text-[clamp(2rem,4vw,2.8rem)] font-black leading-none tracking-[-0.035em] text-[#062e63]">Gestión de solicitudes</h1>
      <p className="mb-0 mt-6 max-w-3xl text-lg leading-7 text-slate-500">Seleccione una subsección para administrar los recursos asociados a las solicitudes ciudadanas.</p>
    </header>
    <section aria-labelledby="solicitudes-secciones-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="m-0 text-xs font-extrabold uppercase tracking-[0.16em] text-[#1476cf]">Centro de gestión</p><h2 className="mb-0 mt-2 text-2xl font-black tracking-[-0.025em] text-[#073b79]" id="solicitudes-secciones-title">¿Qué desea administrar?</h2></div><span className="rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-bold text-[#526d8c]">3 secciones disponibles</span></div>
      <div className="grid grid-cols-3 gap-5 max-[980px]:grid-cols-2 max-[680px]:grid-cols-1">
        {sections.map(({ title, description, eyebrow, action, path, icon: SectionIcon }, index) => (
          <Link className="group relative isolate flex min-h-[300px] flex-col overflow-hidden rounded-[26px] border border-sky-100 bg-white p-6 text-inherit no-underline shadow-[0_12px_30px_rgba(39,112,166,0.11)] transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-[0_22px_45px_rgba(39,112,166,0.19)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-sky-400 motion-reduce:transform-none motion-reduce:transition-none" key={path} to={path}>
            <span className="pointer-events-none absolute -right-16 -top-16 -z-10 size-48 rounded-full bg-sky-300/25 blur-2xl transition-transform duration-500 group-hover:scale-125 motion-reduce:transform-none" aria-hidden="true" />
            <div className="flex items-start justify-between gap-4"><span className="grid size-16 shrink-0 place-items-center rounded-[20px] bg-sky-100 text-[#1476cf] shadow-inner"><SectionIcon size={31} stroke={1.9} aria-hidden="true" /></span><span className="text-5xl font-black leading-none text-sky-100" aria-hidden="true">0{index + 1}</span></div>
            <p className="mb-0 mt-6 text-[0.7rem] font-extrabold uppercase tracking-[0.13em] text-[#6f8dad]">{eyebrow}</p><h3 className="mb-0 mt-2 text-[1.3rem] font-black leading-tight tracking-[-0.025em] text-[#073b79]">{title}</h3><p className="mb-6 mt-3 text-sm leading-6 text-slate-500">{description}</p>
            <span className="mt-auto flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#0872d3] to-[#3298dc] px-5 font-extrabold text-white shadow-[0_9px_20px_rgba(8,114,211,0.22)]">{action}<IconArrowUpRight className="shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transform-none" size={20} aria-hidden="true" /></span>
          </Link>
        ))}
      </div>
    </section>
  </div></main>
)

export default SolicitudesAdminHomePage
