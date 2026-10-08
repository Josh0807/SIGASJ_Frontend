import { IconUserPlus, IconUsers } from '@tabler/icons-react'
import { Link, useLocation } from 'react-router-dom'
import { ASOCIADO_NEW_PATH } from './asociadosPaths'

export default function AsociadosPage() {
  const location = useLocation()
  const success = (location.state as { success?: string } | null)?.success
  return <main className="grid gap-6">
    {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-semibold text-emerald-800 shadow-sm" role="status">{success}</div> : null}
    <header className="flex flex-col gap-5 rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:p-8 lg:flex-row lg:items-center lg:justify-between">
      <div><p className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">Administración · Asociados</p><h1 className="m-0 text-3xl font-black tracking-tight text-[#062e63] sm:text-4xl">Gestión de asociados</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">Registre y administre la información de las personas asociadas.</p></div>
      <Link to={ASOCIADO_NEW_PATH} className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-6 py-3.5 font-extrabold text-white no-underline shadow-[0_11px_26px_rgba(37,99,235,0.3)] transition hover:-translate-y-1 hover:text-white hover:no-underline hover:shadow-[0_17px_34px_rgba(37,99,235,0.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 motion-reduce:transform-none motion-reduce:transition-none"><IconUserPlus size={20} aria-hidden="true" />Registrar asociado</Link>
    </header>
    <section className="grid min-h-56 place-items-center rounded-3xl border border-sky-100 bg-white p-8 text-center shadow-[0_12px_30px_rgba(30,90,156,0.07)]"><div className="max-w-lg"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-50 text-blue-700"><IconUsers size={32} aria-hidden="true" /></span><h2 className="mt-4 text-xl font-extrabold text-[#073b73]">Padrón de asociados</h2><p className="mt-2 leading-7 text-slate-500">Use “Registrar asociado” para agregar una nueva persona al sistema.</p></div></section>
  </main>
}
