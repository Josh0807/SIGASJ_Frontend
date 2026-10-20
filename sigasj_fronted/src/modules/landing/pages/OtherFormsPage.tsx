import { IconFileDownload, IconFiles } from '@tabler/icons-react'
import { useLayoutEffect } from 'react'
import PublicReceiptNavbar from '../../recibos/components/PublicReceiptNavbar'
import Footer from '../components/Footer'

const OtherFormsPage = () => {
  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  return (
    <>
      <PublicReceiptNavbar returnTo="/#solicitudes-servicio" />
      <main className="relative isolate min-h-[65vh] overflow-hidden bg-[linear-gradient(135deg,#fbfdff_0%,#edf8ff_55%,#e4f5ff_100%)] px-6 py-14 max-[640px]:px-4 max-[640px]:py-10" aria-label="Otros formularios descargables" aria-labelledby="other-forms-title">
        <div className="pointer-events-none absolute -left-48 top-16 -z-10 h-[430px] w-[390px] rotate-[-18deg] rounded-[45%] bg-sky-200/35" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-44 top-24 -z-10 h-52 w-[520px] -rotate-[18deg] rounded-[50%] border-[44px] border-sky-300/20" aria-hidden="true" />

        <div className="mx-auto w-full max-w-[980px]">
          <header className="max-w-[760px]">
            <p className="mb-2 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.28em] text-[#1476cf] before:h-0.5 before:w-9 before:bg-[#1476cf]">Documentos públicos</p>
            <h1 id="other-forms-title" className="m-0 text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-none tracking-[-0.04em] text-[#092e67]">Otros Formularios</h1>
            <p className="mb-0 mt-5 text-base leading-7 text-[#526d8c]">En esta sección podrás consultar y descargar formularios adicionales publicados por la Administración de la ASADA. Estos documentos no se completan en línea.</p>
          </header>

          <section className="mt-9 rounded-[24px] border border-white bg-white/90 px-8 py-10 text-center shadow-[0_14px_32px_rgba(39,112,166,0.13)] max-[640px]:px-5" aria-label="Formularios disponibles">
            <span className="mx-auto grid size-20 place-items-center rounded-[22px] bg-gradient-to-br from-[#edf8ff] to-[#dceffd] text-[#1476cf]">
              <IconFiles size={42} aria-hidden="true" />
            </span>
            <h2 className="mb-0 mt-5 text-2xl font-extrabold text-[#073b79]">Formularios descargables</h2>
            <p className="mx-auto mb-0 mt-3 max-w-[600px] leading-7 text-[#526d8c]" role="status">No hay formularios adicionales publicados por el momento.</p>
            <p className="mx-auto mb-0 mt-4 flex w-fit items-center gap-2 text-sm font-semibold text-[#607a98]"><IconFileDownload size={20} aria-hidden="true" /> Los nuevos documentos aparecerán aquí cuando sean publicados.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default OtherFormsPage
