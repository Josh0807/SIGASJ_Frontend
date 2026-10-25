import {
  IconFileDownload,
  IconFiles,
  IconRefresh,
} from '@tabler/icons-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import PublicReceiptNavbar from '../../recibos/components/PublicReceiptNavbar'
import {
  downloadFormularioDescargablePublico,
  listFormulariosDescargablesPublicos,
  toFormulariosDescargablesPublicError,
  type FormularioDescargablePublico,
} from '../../solicitudes-publicas/formularios-descargables/formulariosDescargablesPublicApi'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import FormularioDescargableCard from '../components/FormularioDescargableCard'
import Footer from '../components/Footer'

const OtherFormsPage = () => {
  const [items, setItems] = useState<FormularioDescargablePublico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [downloadErrors, setDownloadErrors] = useState<Record<number, string>>(
    {},
  )
  const downloadingRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await listFormulariosDescargablesPublicos())
    } catch (caught) {
      setError(toFormulariosDescargablesPublicError(caught))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => runAfterEffect(() => {
    void load()
  }), [load])

  const handleDownload = async (formulario: FormularioDescargablePublico) => {
    if (downloadingRef.current !== null) return
    downloadingRef.current = formulario.id
    setDownloadingId(formulario.id)
    setDownloadErrors((current) => {
      const next = { ...current }
      delete next[formulario.id]
      return next
    })
    try {
      await downloadFormularioDescargablePublico(
        formulario.id,
        formulario.nombreArchivoOriginal || formulario.nombre,
      )
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : 'No fue posible descargar el formulario. Intenta nuevamente.'
      setDownloadErrors((current) => ({
        ...current,
        [formulario.id]: message,
      }))
      // Si fue inactivado entre listado y descarga: refrescar catálogo.
      if (message.includes('no está disponible') || message.includes('404')) {
        void load()
      }
    } finally {
      downloadingRef.current = null
      setDownloadingId(null)
    }
  }

  return (
    <>
      <PublicReceiptNavbar returnTo="/#solicitudes-servicio" />
      <main
        className="relative isolate min-h-[65vh] overflow-hidden bg-[linear-gradient(135deg,#fbfdff_0%,#edf8ff_55%,#e4f5ff_100%)] px-6 py-14 max-[640px]:px-4 max-[640px]:py-10"
        aria-label="Otros formularios descargables"
        aria-labelledby="other-forms-title"
      >
        <div
          className="pointer-events-none absolute -left-48 top-16 -z-10 h-[430px] w-[390px] rotate-[-18deg] rounded-[45%] bg-sky-200/35"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-44 top-24 -z-10 h-52 w-[520px] -rotate-[18deg] rounded-[50%] border-[44px] border-sky-300/20"
          aria-hidden="true"
        />

        <div className="mx-auto w-full max-w-[980px]">
          <header className="max-w-[760px]">
            <p className="mb-2 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.28em] text-[#1476cf] before:h-0.5 before:w-9 before:bg-[#1476cf]">
              Documentos públicos
            </p>
            <h1
              id="other-forms-title"
              className="m-0 text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-none tracking-[-0.04em] text-[#092e67]"
            >
              Formularios descargables
            </h1>
            <p className="mb-0 mt-5 text-base leading-7 text-[#526d8c]">
              Consulte y descargue formularios adicionales publicados por la
              ASADA. Estos documentos no se completan en línea ni inician un
              trámite digital.
            </p>
          </header>

          {loading ? (
            <p
              className="mt-9 rounded-[24px] border border-white bg-white/90 px-8 py-10 text-center font-semibold text-[#607a98] shadow-[0_14px_32px_rgba(39,112,166,0.13)]"
              role="status"
            >
              Cargando formularios disponibles…
            </p>
          ) : error ? (
            <div
              className="mt-9 rounded-[24px] border border-red-200 bg-red-50 px-8 py-8 text-center shadow-sm max-[640px]:px-5"
              role="alert"
            >
              <p className="m-0 font-semibold text-red-800">{error}</p>
              <button
                className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-red-300 bg-white px-5 font-extrabold text-red-800"
                type="button"
                onClick={() => void load()}
              >
                <IconRefresh size={18} aria-hidden="true" /> Reintentar
              </button>
            </div>
          ) : items.length === 0 ? (
            <section
              className="mt-9 rounded-[24px] border border-white bg-white/90 px-8 py-10 text-center shadow-[0_14px_32px_rgba(39,112,166,0.13)] max-[640px]:px-5"
              aria-label="Formularios disponibles"
            >
              <span className="mx-auto grid size-20 place-items-center rounded-[22px] bg-gradient-to-br from-[#edf8ff] to-[#dceffd] text-[#1476cf]">
                <IconFiles size={42} aria-hidden="true" />
              </span>
              <h2 className="mb-0 mt-5 text-2xl font-extrabold text-[#073b79]">
                Formularios descargables
              </h2>
              <p
                className="mx-auto mb-0 mt-3 max-w-[600px] leading-7 text-[#526d8c]"
                role="status"
              >
                No hay formularios adicionales disponibles en este momento.
              </p>
              <p className="mx-auto mb-0 mt-4 flex w-fit items-center gap-2 text-sm font-semibold text-[#607a98]">
                <IconFileDownload size={20} aria-hidden="true" /> Los nuevos
                documentos aparecerán aquí cuando sean publicados.
              </p>
            </section>
          ) : (
            <section
              className="mt-9 grid grid-cols-2 gap-5 max-[820px]:grid-cols-1"
              aria-label="Formularios disponibles"
            >
              {items.map((formulario) => (
                <FormularioDescargableCard
                  key={formulario.id}
                  formulario={formulario}
                  downloading={downloadingId === formulario.id}
                  downloadError={downloadErrors[formulario.id] ?? null}
                  onDownload={(item) => {
                    void handleDownload(item)
                  }}
                />
              ))}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default OtherFormsPage
