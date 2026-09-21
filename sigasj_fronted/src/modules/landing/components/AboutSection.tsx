import { IconArrowRight, IconDroplet, IconEye, IconFileDescription } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import asadaPhoto from '../../../assets/FOTOASADA.png'

const IdentityIcon = ({ children }: { children: ReactNode }) => (
  <span className="grid size-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#edf8ff] to-[#dceffd] text-[#0871cf] max-[640px]:size-12" aria-hidden="true">
    {children}
  </span>
)

const AboutSection = () => (
  <section
    id="sobre-nosotros"
    className="relative isolate min-h-0 overflow-hidden bg-[linear-gradient(135deg,#fbfdff_0%,#edf8ff_56%,#e1f3ff_100%)] px-6 pb-14 pt-28 max-[640px]:px-4 max-[640px]:pb-10 max-[640px]:pt-20"
    aria-labelledby="sobre-nosotros-title"
  >
    <div className="pointer-events-none absolute -left-52 top-28 -z-10 h-[520px] w-[440px] rotate-[-18deg] rounded-[45%] bg-sky-200/35" aria-hidden="true" />
    <div className="pointer-events-none absolute -left-60 top-[390px] -z-10 h-44 w-[430px] rotate-[14deg] rounded-[50%] border-[38px] border-sky-300/20" aria-hidden="true" />
    <div className="pointer-events-none absolute -right-40 -top-28 -z-10 h-[360px] w-[440px] -rotate-[28deg] rounded-[50%] bg-sky-200/40" aria-hidden="true" />
    <div className="pointer-events-none absolute -right-48 top-20 -z-10 h-52 w-[480px] -rotate-[24deg] rounded-[50%] border-[42px] border-white/45" aria-hidden="true" />
    <div className="pointer-events-none absolute -left-[1.5rem] top-[270px] -z-10 grid gap-5 text-sky-300/65" aria-hidden="true">
      <IconDroplet className="fill-current" size={38} />
      <IconDroplet className="ml-10 fill-current" size={30} />
    </div>

    <div className="mx-auto w-full max-w-[1180px]">
      <header className="mb-7 max-w-3xl">
        <p className="mb-2 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.28em] text-[#1476cf] before:h-0.5 before:w-9 before:bg-[#1476cf]">
          Nuestra identidad
        </p>
        <h2 id="sobre-nosotros-title" className="m-0 text-[clamp(2.2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.04em] text-[#092e67]">
          Sobre nosotros
        </h2>
      </header>

      <div className="grid grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] gap-6 max-[900px]:grid-cols-1">
        <figure className="m-0 h-[420px] overflow-hidden rounded-[26px] shadow-[0_18px_40px_rgba(32,104,159,0.16)] max-[900px]:h-auto max-[900px]:aspect-[16/10] max-[640px]:rounded-2xl">
          <img className="h-full w-full object-cover" src={asadaPhoto} alt="Instalaciones de la ASADA San Juan" />
        </figure>

        <div className="grid h-[420px] grid-rows-2 gap-5 max-[900px]:h-auto">
          <article className="relative grid grid-cols-[auto_1px_minmax(0,1fr)] items-center gap-6 overflow-hidden rounded-[22px] border border-white bg-white/90 px-7 py-6 shadow-[0_12px_28px_rgba(39,112,166,0.12)] backdrop-blur-sm transition duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_20px_38px_rgba(39,112,166,0.18)] focus-within:-translate-y-2 focus-within:shadow-[0_20px_38px_rgba(39,112,166,0.18)] motion-reduce:transform-none motion-reduce:transition-none max-[640px]:grid-cols-[auto_minmax(0,1fr)] max-[640px]:gap-4 max-[640px]:rounded-2xl max-[640px]:px-5 max-[640px]:py-6">
            <span className="pointer-events-none absolute -right-16 -bottom-20 h-28 w-64 -rotate-12 rounded-[50%] bg-sky-200/35" aria-hidden="true" />
            <span className="pointer-events-none absolute -right-20 -bottom-24 h-28 w-72 -rotate-6 rounded-[50%] border-[18px] border-sky-300/20" aria-hidden="true" />
            <IdentityIcon><IconEye size={34} stroke={1.8} /></IdentityIcon>
            <span className="h-20 bg-sky-200 max-[640px]:hidden" aria-hidden="true" />
            <div className="relative z-10">
              <h3 className="m-0 mb-2 text-2xl font-extrabold leading-tight text-[#093b82] max-[640px]:text-xl">Visión</h3>
              <p className="m-0 text-[0.95rem] leading-6 text-[#405d7d] max-[640px]:text-sm">Ser una ASADA líder y reconocida por la excelencia en la gestión del agua, la protección del recurso hídrico, la innovación, la transparencia y el compromiso con el desarrollo sostenible de la comunidad y las futuras generaciones.</p>
            </div>
          </article>

          <article className="relative grid grid-cols-[auto_1px_minmax(0,1fr)] items-center gap-6 overflow-hidden rounded-[22px] border border-white bg-white/90 px-7 py-6 shadow-[0_12px_28px_rgba(39,112,166,0.12)] backdrop-blur-sm transition duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_20px_38px_rgba(39,112,166,0.18)] focus-within:-translate-y-2 focus-within:shadow-[0_20px_38px_rgba(39,112,166,0.18)] motion-reduce:transform-none motion-reduce:transition-none max-[640px]:grid-cols-[auto_minmax(0,1fr)] max-[640px]:gap-4 max-[640px]:rounded-2xl max-[640px]:px-5 max-[640px]:py-6">
            <span className="pointer-events-none absolute -right-16 -bottom-20 h-28 w-64 -rotate-12 rounded-[50%] bg-sky-200/35" aria-hidden="true" />
            <span className="pointer-events-none absolute -right-20 -bottom-24 h-28 w-72 -rotate-6 rounded-[50%] border-[18px] border-sky-300/20" aria-hidden="true" />
            <IdentityIcon><IconDroplet size={34} stroke={1.8} /></IdentityIcon>
            <span className="h-20 bg-sky-200 max-[640px]:hidden" aria-hidden="true" />
            <div className="relative z-10">
              <h3 className="m-0 mb-2 text-2xl font-extrabold leading-tight text-[#093b82] max-[640px]:text-xl">Misión</h3>
              <p className="m-0 text-[0.95rem] leading-6 text-[#405d7d] max-[640px]:text-sm">Brindar un servicio de agua potable de calidad a la comunidad de San Juan de Santa Cruz, administrando el recurso hídrico de manera eficiente, transparente y sostenible, promoviendo su uso responsable y contribuyendo al bienestar de todos los usuarios.</p>
            </div>
          </article>
        </div>
      </div>

      <details className="group relative mt-6 overflow-hidden rounded-[20px] border border-sky-100 bg-white/75 shadow-[0_10px_24px_rgba(39,112,166,0.1)] backdrop-blur-sm transition duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_20px_38px_rgba(39,112,166,0.17)] focus-within:-translate-y-2 focus-within:shadow-[0_20px_38px_rgba(39,112,166,0.17)] motion-reduce:transform-none motion-reduce:transition-none">
        <span className="pointer-events-none absolute -bottom-20 left-1/3 h-32 w-[600px] rotate-6 rounded-[50%] bg-sky-200/35" aria-hidden="true" />
        <span className="pointer-events-none absolute -bottom-24 left-[38%] h-32 w-[650px] rotate-3 rounded-[50%] border-[24px] border-sky-300/15" aria-hidden="true" />
        <summary className="relative z-10 flex min-h-[92px] cursor-pointer list-none items-center gap-5 px-8 py-4 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-sky-400 [&::-webkit-details-marker]:hidden max-[640px]:min-h-0 max-[640px]:flex-wrap max-[640px]:gap-4 max-[640px]:px-5">
          <IdentityIcon><IconFileDescription size={30} stroke={1.8} /></IdentityIcon>
          <span className="h-14 w-px bg-sky-300 max-[640px]:hidden" aria-hidden="true" />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <strong className="text-xl font-extrabold text-[#093b82] max-[640px]:text-lg">Reseña histórica</strong>
            <small className="text-sm text-[#4a6b8d]">Conozca el origen y la evolución de nuestra ASADA</small>
          </span>
          <span className="flex min-h-11 items-center gap-3 rounded-full bg-gradient-to-r from-[#0872d3] to-[#2f91da] px-6 text-sm font-bold text-white shadow-[0_8px_18px_rgba(8,114,211,0.22)] transition group-hover:-translate-y-0.5 max-[640px]:ml-auto max-[640px]:min-h-10 max-[640px]:px-5">
            Leer más <IconArrowRight className="transition-transform group-open:rotate-90" size={19} aria-hidden="true" />
          </span>
        </summary>
        <div className="border-t border-sky-100 px-8 py-6 text-[0.95rem] leading-7 text-[#405d7d] max-[640px]:px-5">
          <p className="m-0 whitespace-pre-line">{`La Asociación Administradora del Sistema de Acueducto y Alcantarillado Sanitario (ASADA) de San Juan de Santa Cruz, Guanacaste, tiene sus orígenes en el año 2003, cuando el 24 de septiembre, un grupo de 53 vecinos fundadores se reunió en el salón comunal con el propósito de constituir una organización encargada de administrar, operar y proteger el sistema de abastecimiento de agua potable de la comunidad.

El acueducto que abastece a la comunidad había sido construido en 1977, respondiendo a las necesidades de la población de aquella época. Con el paso de los años, el crecimiento poblacional y el aumento en la demanda del servicio hicieron necesaria una administración comunal organizada que garantizara el acceso al agua potable y el mantenimiento de la infraestructura.

Desde su creación, la ASADA San Juan ha trabajado en el mejoramiento continuo del servicio, velando por la conservación de las fuentes de agua, el mantenimiento de la red de distribución y la promoción del uso responsable del recurso hídrico. Gracias al esfuerzo conjunto de sus juntas directivas, personal administrativo, fontaneros y usuarios, la asociación se ha consolidado como una organización comprometida con el bienestar y el desarrollo de la comunidad.

En la actualidad, la ASADA continúa enfrentando el reto de modernizar y ampliar su infraestructura para responder al crecimiento de la población y garantizar un servicio de agua potable eficiente, seguro y sostenible para las generaciones presentes y futuras.`}</p>
        </div>
      </details>
    </div>
  </section>
)

export default AboutSection
