import { Link } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight, IconClipboardCheck } from '@tabler/icons-react'
import ActivityFeedback from '../components/ActivityFeedback'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { useTiposActividadFontanero } from '../hooks/useTiposActividadFontanero'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'

const SeleccionarTipoActividadPage = () => {
  const catalogo = useTiposActividadFontanero()
  return (
    <section
      className="actividades-fontanero-registro actividades-fontanero-registro--selector !mx-0 !max-w-none !gap-7"
      aria-labelledby="seleccion-tipo-actividad-title"
    >
      <header className="actividades-fontanero-registro__header !block !rounded-[28px] !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/70 !px-8 !py-8 !shadow-[0_14px_38px_rgba(30,90,156,0.10)] md:!px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <p className="actividades-fontanero-registro__eyebrow !text-sm !font-black !tracking-[0.12em] !text-blue-600">Registro de Actividades</p>
            <h1 id="seleccion-tipo-actividad-title" className="!text-3xl !font-black !tracking-tight !text-[#07376f] md:!text-4xl">Registrar actividad</h1>
            <p className="actividades-fontanero-registro__intro !text-lg !leading-relaxed !text-slate-500">
              Seleccione el tipo de actividad que desea registrar. Cada tipo abre su formulario
              correspondiente.
            </p>
          </div>
          <Link to={ACTIVIDADES_FONTANERO_PATHS.home} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 font-bold !no-underline text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:bg-blue-50 hover:!no-underline focus:!no-underline">
            <IconArrowLeft size={20} aria-hidden="true" />
            Volver al menú de actividades
          </Link>
        </div>
      </header>

      {catalogo.isLoading ? <p role="status">Cargando tipos de actividad…</p> : null}
      {catalogo.isUnauthorized ? (
        <ActivityFeedback
          variant="warning"
          message={ACTIVITY_FEEDBACK_MESSAGES.unauthorized}
        />
      ) : null}
      {catalogo.isForbidden ? (
        <ActivityFeedback
          variant="error"
          message={ACTIVITY_FEEDBACK_MESSAGES.forbidden}
        />
      ) : null}
      {catalogo.isError ? (
        <ActivityFeedback
          variant="error"
          message={ACTIVITY_FEEDBACK_MESSAGES.loadGeneric}
          action={
            <button type="button" className="activity-feedback__retry" onClick={catalogo.refetch}>
              Reintentar
            </button>
          }
        />
      ) : null}
      {catalogo.isEmpty ? (
        <ActivityFeedback
          variant="info"
          message="No hay tipos de actividad disponibles."
        />
      ) : null}

      <div
        className="actividad-tipo-selector !grid-cols-1 !gap-5 rounded-[28px] border border-blue-100 bg-white/80 p-5 shadow-[0_14px_38px_rgba(30,90,156,0.08)] md:!grid-cols-2 md:p-7 xl:!grid-cols-3"
        role="list"
        aria-label="Tipos de actividad disponibles"
      >
        <div className="col-span-full border-b border-blue-100 pb-5" role="presentation">
          <p className="mb-1 text-sm font-black uppercase tracking-[0.12em] text-blue-600">Tipos disponibles</p>
          <h2 className="m-0 text-2xl font-black tracking-tight text-[#07376f]">Seleccione una actividad</h2>
          <p className="mt-2 text-base text-slate-500">Elija una opción para abrir su formulario correspondiente.</p>
        </div>
        {catalogo.tipos.map((tipo) => (
          <article
            key={tipo.codigo}
            className="actividad-tipo-selector__card group !gap-5 !rounded-3xl !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/60 !p-6 !shadow-[0_10px_28px_rgba(30,90,156,0.08)] transition duration-200 hover:-translate-y-1 hover:!border-blue-300 hover:!shadow-[0_18px_36px_rgba(30,90,156,0.14)]"
            role="listitem"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-200">
                <IconClipboardCheck size={24} stroke={1.9} aria-hidden="true" />
              </span>
              <h2 className="actividad-tipo-selector__title !text-xl !font-extrabold !text-[#07376f]">{tipo.nombre}</h2>
            </div>
            {tipo.descripcion ? (
              <p className="actividad-tipo-selector__description">{tipo.descripcion}</p>
            ) : null}
            <Link
              to={ACTIVIDADES_FONTANERO_PATHS.registrarTipo(tipo.codigo)}
              className="actividad-tipo-selector__link !mt-auto !flex !w-full !items-center !justify-between !rounded-2xl !bg-gradient-to-r !from-blue-600 !to-sky-500 !px-5 !py-3.5 !font-bold !text-white !shadow-lg !shadow-blue-200/70 transition hover:!from-blue-700 hover:!to-sky-600 focus-visible:!ring-4 focus-visible:!ring-blue-200"
              data-testid={`tipo-actividad-${tipo.codigo}`}
            >
              <span>Continuar</span>
              <IconArrowRight size={20} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>

      <Link to={ACTIVIDADES_FONTANERO_PATHS.home} className="actividades-fontanero-registro__back !hidden">
        <IconArrowLeft size={20} aria-hidden="true" />
        Volver al menú de actividades
      </Link>
    </section>
  )
}

export default SeleccionarTipoActividadPage
