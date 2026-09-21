import { IconArrowRight, IconBuildingBank, IconBuildingStore, IconClock, IconDeviceMobile, IconMapPin } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { BANCO_NACIONAL_URL } from '../config/externalLinks'

const ReceiptPaymentSection = () => {
  const navigate = useNavigate()

  return (
    <section className="sigasj-receipt-section relative isolate min-h-0 overflow-hidden bg-[linear-gradient(135deg,#fbfdff_0%,#edf8ff_55%,#e4f5ff_100%)] px-6 py-14 max-[640px]:px-4 max-[640px]:py-10" id="pagos" aria-labelledby="receipt-payment-title">
      <div className="pointer-events-none absolute -left-44 top-32 -z-10 h-[420px] w-[560px] rotate-[-14deg] rounded-[50%] border-[50px] border-sky-300/15" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-48 top-28 -z-10 h-[380px] w-[620px] -rotate-[18deg] rounded-[50%] bg-sky-200/25" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 left-[20%] -z-10 h-64 w-[980px] rotate-3 rounded-[50%] border-[54px] border-sky-300/15" aria-hidden="true" />

      <div className="sigasj-receipt-shell mx-auto w-full max-w-[1050px]">
        <article className="sigasj-receipt-banner relative flex min-h-[165px] items-center justify-between gap-8 overflow-hidden rounded-[18px] bg-gradient-to-r from-[#1266bd] to-[#2d93d7] px-11 py-8 text-white shadow-[0_14px_34px_rgba(18,102,189,0.22)] max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:px-6">
          <div className="relative z-10">
            <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.28em] text-sky-100">Consulta en línea</p>
            <h2 id="receipt-payment-title" className="m-0 text-3xl font-extrabold leading-tight text-white">Consulta tu recibo</h2>
            <p className="mb-0 mt-3 text-sm text-sky-50">Revisa de forma rápida la información de tu recibo de agua.</p>
          </div>
          <div className="relative z-10 grid w-[270px] shrink-0 gap-3 text-center max-[700px]:w-full">
            <button type="button" className="receipt-payment__button inline-flex min-h-12 cursor-pointer items-center justify-center gap-7 rounded-full border-0 bg-white px-6 text-sm font-extrabold text-[#0872d3] shadow-[0_8px_18px_rgba(4,56,112,0.2)] transition hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(4,56,112,0.3)]" onClick={() => navigate('/consulta-recibo')}>
              Consultar recibo <IconArrowRight size={19} aria-hidden="true" />
            </button>
            <p id="receipt-payment-note" className="m-0 text-xs leading-5 text-sky-50">Haz clic en el botón para realizar la consulta en la plataforma de SIGASJ.</p>
          </div>
          <div className="pointer-events-none absolute left-[58%] top-1/2 size-36 -translate-y-1/2 rounded-full bg-white/5" aria-hidden="true" />
        </article>

        <div className="sigasj-payment-panel mt-8 rounded-[20px] border border-sky-100 bg-white/90 p-7 shadow-[0_14px_34px_rgba(39,112,166,0.12)] backdrop-blur-sm" aria-labelledby="payment-methods-title">
          <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.25em] text-[#1476cf]">Opciones disponibles</p>
          <h2 id="payment-methods-title" className="m-0 text-3xl font-extrabold leading-tight text-[#092e67]">Métodos de pago</h2>
          <p className="mb-0 mt-2 text-sm text-[#526d8c]">Elige la alternativa que mejor se adapte a tus necesidades.</p>

          <div className="sigasj-payment-grid mt-5 grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
            <article className="sigasj-payment-card flex min-h-[340px] flex-col rounded-[16px] border border-sky-100 bg-white p-5 shadow-[0_8px_20px_rgba(39,112,166,0.09)] transition hover:-translate-y-1.5 hover:shadow-[0_16px_30px_rgba(39,112,166,0.16)]">
              <div className="grid size-12 place-items-center rounded-[14px] bg-sky-100 text-[#0872d3]"><IconDeviceMobile size={27} aria-hidden="true" /></div>
              <h3 className="mb-0 mt-3 text-base font-extrabold text-[#093b82]">SINPE Móvil</h3>
              <p className="mb-0 mt-1 text-sm leading-5 text-[#526d8c]">Realiza el pago de tu recibo mediante SINPE Móvil al número indicado.</p>
              <div className="mt-3 grid gap-3">
                <p className="m-0 rounded-xl bg-sky-50 px-4 py-3"><span className="block text-[0.62rem] font-bold uppercase text-[#607a98]">Número demostrativo</span><strong className="mt-1 block text-lg tracking-[0.08em] text-[#0872d3]">0000-0000</strong></p>
                <p className="m-0 rounded-xl border-l-2 border-amber-400 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900" role="note">Todo pago realizado por SinpeMóvil debe ser enviado al WhatsApp de la ASADA San Juan.</p>
              </div>
            </article>

            <article className="sigasj-payment-card flex min-h-[340px] flex-col rounded-[16px] border border-sky-100 bg-white p-5 shadow-[0_8px_20px_rgba(39,112,166,0.09)] transition hover:-translate-y-1.5 hover:shadow-[0_16px_30px_rgba(39,112,166,0.16)]">
              <div className="grid size-12 place-items-center rounded-[14px] bg-sky-100 text-[#0872d3]"><IconBuildingBank size={27} aria-hidden="true" /></div>
              <h3 className="mb-0 mt-3 text-base font-extrabold text-[#093b82]">Banco Nacional</h3>
              <p className="mb-0 mt-1 text-sm leading-5 text-[#526d8c]">Paga por medio de los canales disponibles del Banco Nacional.</p>
              <ul className="mt-4 grid gap-2 pl-5 text-sm text-[#526d8c]"><li>Banca en línea</li><li>Aplicación móvil</li><li>Sucursales</li></ul>
              <a className="mt-auto inline-flex min-h-11 items-center justify-center gap-5 rounded-xl border border-[#0872d3] bg-white px-5 text-sm font-extrabold text-[#0872d3] no-underline transition hover:-translate-y-1 hover:bg-[#0872d3] hover:text-white" href={BANCO_NACIONAL_URL} target="_blank" rel="noopener noreferrer" aria-label="Ir al Banco Nacional (abre una plataforma externa en una pestaña nueva)">Ir al Banco Nacional <IconArrowRight size={18} aria-hidden="true" /></a>
            </article>

            <article className="sigasj-payment-card flex min-h-[340px] flex-col rounded-[16px] border border-sky-100 bg-white p-5 shadow-[0_8px_20px_rgba(39,112,166,0.09)] transition hover:-translate-y-1.5 hover:shadow-[0_16px_30px_rgba(39,112,166,0.16)]">
              <div className="grid size-12 place-items-center rounded-[14px] bg-sky-100 text-[#0872d3]"><IconBuildingStore size={27} aria-hidden="true" /></div>
              <h3 className="mb-0 mt-3 text-base font-extrabold text-[#093b82]">Ventanilla de la ASADA</h3>
              <p className="mb-0 mt-1 text-sm leading-5 text-[#526d8c]">Visita nuestra ventanilla para realizar el pago de forma presencial.</p>
              <dl className="mt-3 grid gap-2">
                <div className="relative rounded-xl bg-sky-50 py-3 pl-12 pr-4"><IconClock className="absolute left-4 top-4 text-[#0872d3]" size={18} aria-hidden="true" /><dt className="text-[0.62rem] font-bold uppercase text-[#607a98]">Horario</dt><dd className="m-0 mt-1 text-xs font-bold text-[#174f88]">Lunes a sábado</dd></div>
                <div className="relative rounded-xl bg-sky-50 py-3 pl-12 pr-4"><IconMapPin className="absolute left-4 top-4 text-[#0872d3]" size={18} aria-hidden="true" /><dt className="text-[0.62rem] font-bold uppercase text-[#607a98]">Atención</dt><dd className="m-0 mt-1 text-xs font-bold text-[#174f88]">7:30 a. m. a 11:30 a. m.</dd></div>
              </dl>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReceiptPaymentSection
