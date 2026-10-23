import { IconArrowRight, IconFiles } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { FORMULARIOS_OFICIALES_ADMIN_PATH } from './solicitudesAdminPaths'

const SolicitudesAdminHomePage = () => (
  <main className="admin-content-modern min-w-0">
    <div className="mx-auto grid w-full max-w-[1180px] gap-6">
      <header className="min-h-[220px] rounded-[24px] border border-sky-100 bg-white p-8 shadow-[0_12px_32px_rgba(39,112,166,0.08)] max-[640px]:min-h-0 max-[640px]:p-6">
        <p className="m-0 text-sm font-extrabold uppercase tracking-[0.1em] text-blue-600">Administración · Solicitudes</p>
        <h1 className="mb-0 mt-5 text-[clamp(2rem,4vw,2.8rem)] font-black leading-none tracking-[-0.035em] text-[#062e63]">Gestión de solicitudes</h1>
        <p className="mb-0 mt-6 max-w-3xl text-lg leading-7 text-slate-500">Seleccione una subsección para administrar los recursos asociados a las solicitudes ciudadanas.</p>
      </header>

      <section aria-labelledby="solicitudes-secciones-title">
        <h2 className="mb-4 mt-0 text-xl font-extrabold text-[#073b79]" id="solicitudes-secciones-title">Secciones disponibles</h2>
        <Link className="group flex max-w-xl items-center gap-5 rounded-[22px] border border-sky-100 bg-white p-6 text-inherit no-underline shadow-[0_10px_28px_rgba(39,112,166,0.1)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_38px_rgba(39,112,166,0.16)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-sky-400 motion-reduce:transform-none" to={FORMULARIOS_OFICIALES_ADMIN_PATH}>
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sky-100 text-[#1476cf]"><IconFiles size={28} aria-hidden="true" /></span>
          <span className="min-w-0 flex-1"><strong className="block text-lg font-extrabold text-[#073b79]">Formularios oficiales</strong><span className="mt-1 block text-sm leading-6 text-slate-500">Suba o reemplace los PDF oficiales de los seis trámites digitales.</span></span>
          <IconArrowRight className="shrink-0 text-blue-600 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" size={22} aria-hidden="true" />
        </Link>
      </section>
    </div>
  </main>
)

export default SolicitudesAdminHomePage
