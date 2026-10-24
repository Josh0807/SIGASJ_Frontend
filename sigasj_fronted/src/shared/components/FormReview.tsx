import { IconEdit, IconFileDescription, IconPaperclip } from '@tabler/icons-react'
import type { FormReviewProps } from '../props/FormReviewProps'
import { useFormWizardNavigation } from './FormWizardNavigation'

export type { FormReviewDocument, FormReviewItem, FormReviewProps, FormReviewSection } from '../props/FormReviewProps'

const formatFileSize = (bytes?: number) => {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const hasDisplayValue = (value: unknown) =>
  value !== null && value !== undefined && value !== ''

const FormReview = ({
  sections,
  documents = [],
  documentsStepIndex,
  emptyValue = 'No indicado',
  emptyDocumentsMessage = 'No se seleccionaron documentos.',
  className = '',
}: FormReviewProps) => {
  const { goToStep } = useFormWizardNavigation()

  return (
    <div className={['grid gap-5', className].filter(Boolean).join(' ')}>
      {sections.map((section) => (
        <section className="rounded-2xl border border-sky-100 bg-sky-50/40 p-5" key={section.id} aria-labelledby={`review-${section.id}-title`}>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 pb-3">
            <h3 className="m-0 text-lg font-extrabold text-[#073b79]" id={`review-${section.id}-title`}>{section.title}</h3>
            <button className="group inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full border border-sky-200/90 bg-white/90 py-1.5 pl-2 pr-4 text-sm font-extrabold text-[#075fae] shadow-[0_4px_14px_rgba(20,118,207,0.10)] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white hover:text-[#064f91] hover:shadow-[0_8px_20px_rgba(20,118,207,0.18)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 active:translate-y-0 active:shadow-sm max-[480px]:w-full max-[480px]:justify-center motion-reduce:transform-none" type="button" onClick={() => goToStep(section.stepIndex)}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-100 to-blue-100 text-[#1476cf] transition group-hover:from-sky-200 group-hover:to-blue-100" aria-hidden="true">
                <IconEdit size={17} stroke={2.3} />
              </span>
              <span>Corregir información</span>
            </button>
          </header>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 max-[620px]:grid-cols-1">
            {section.items.map((item) => (
              <div className="min-w-0" key={item.label}>
                <dt className="text-sm font-bold text-[#607a98]">{item.label}</dt>
                <dd className="m-0 mt-1 [overflow-wrap:anywhere] font-semibold text-[#173f6e]">{hasDisplayValue(item.value) ? item.value : emptyValue}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <section className="rounded-2xl border border-sky-100 bg-white p-5" aria-labelledby="review-documents-title">
        <header className="flex items-center justify-between gap-4 max-[560px]:flex-col max-[560px]:items-stretch">
          <h3 className="m-0 flex items-center gap-2 text-lg font-extrabold text-[#073b79]" id="review-documents-title"><IconPaperclip size={21} aria-hidden="true" /> Documentos seleccionados</h3>
          {documentsStepIndex !== undefined ? (
            <button className="group inline-flex min-h-11 min-w-[205px] shrink-0 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-sky-200/90 bg-white/90 py-1.5 pl-2 pr-4 text-sm font-extrabold leading-none text-[#075fae] shadow-[0_4px_14px_rgba(20,118,207,0.10)] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white hover:text-[#064f91] hover:shadow-[0_8px_20px_rgba(20,118,207,0.18)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 active:translate-y-0 active:shadow-sm max-[560px]:w-full motion-reduce:transform-none" type="button" onClick={() => goToStep(documentsStepIndex)}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-100 to-blue-100 text-[#1476cf] transition group-hover:from-sky-200 group-hover:to-blue-100" aria-hidden="true">
                <IconEdit size={17} stroke={2.3} />
              </span>
              <span>Corregir documentos</span>
            </button>
          ) : null}
        </header>
        {documents.length > 0 ? (
          <ul className="mb-0 mt-4 grid list-none gap-3 p-0">
            {documents.map((document) => {
              const size = formatFileSize(document.size)
              return (
                <li className="flex min-w-0 items-center gap-3 rounded-xl bg-sky-50 px-4 py-3" key={document.id}>
                  <IconFileDescription className="shrink-0 text-[#1476cf]" size={24} aria-hidden="true" />
                  <span className="min-w-0">
                    <strong className="block truncate text-[#173f6e]">{document.name}</strong>
                    {size || document.type ? <span className="text-xs font-semibold text-[#607a98]">{[document.type, size].filter(Boolean).join(' · ')}</span> : null}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : <p className="mb-0 mt-3 text-[#607a98]">{emptyDocumentsMessage}</p>}
      </section>
    </div>
  )
}

export default FormReview
