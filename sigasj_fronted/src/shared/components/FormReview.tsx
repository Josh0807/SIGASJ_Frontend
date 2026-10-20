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
            <button className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#1476cf] bg-white px-4 text-sm font-bold text-[#0b65b5] transition hover:bg-sky-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400" type="button" onClick={() => goToStep(section.stepIndex)}>
              <IconEdit size={18} aria-hidden="true" /> Corregir información
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
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="m-0 flex items-center gap-2 text-lg font-extrabold text-[#073b79]" id="review-documents-title"><IconPaperclip size={21} aria-hidden="true" /> Documentos seleccionados</h3>
          {documentsStepIndex !== undefined ? (
            <button className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#1476cf] bg-white px-4 text-sm font-bold text-[#0b65b5] transition hover:bg-sky-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400" type="button" onClick={() => goToStep(documentsStepIndex)}>
              <IconEdit size={18} aria-hidden="true" /> Corregir documentos
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
