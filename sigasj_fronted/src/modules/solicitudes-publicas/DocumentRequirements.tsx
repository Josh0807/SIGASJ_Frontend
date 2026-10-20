import { IconAlertCircle, IconCheck, IconFile, IconFileUpload, IconInfoCircle, IconTrash } from '@tabler/icons-react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { DOCUMENT_REQUIREMENTS, type DocumentRequirementKind, type SolicitudPublicaSlug } from './documentRequirementsConfig'

const badges: Record<DocumentRequirementKind, { label: string; className: string }> = {
  required: { label: 'Obligatorio', className: 'bg-blue-100 text-blue-800' },
  conditional: { label: 'Si aplica', className: 'bg-amber-100 text-amber-800' },
  special: { label: 'Requisito especial', className: 'bg-violet-100 text-violet-800' },
}

const fileType = (file: File) => file.type === 'application/pdf' ? 'PDF' : file.type.split('/')[1]?.toUpperCase() || 'Archivo'

type Props = {
  slug: SolicitudPublicaSlug
  files: File[]
  onFilesChange: (files: File[]) => void
  inputProps?: InputHTMLAttributes<HTMLInputElement>
  error?: ReactNode
}

const DocumentRequirements = ({ slug, files, onFilesChange, inputProps, error }: Props) => {
  const config = DOCUMENT_REQUIREMENTS[slug]
  return (
    <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_10px_28px_rgba(39,112,166,0.08)]" aria-labelledby={`${slug}-documents-title`}>
      <header className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50/50 p-5 sm:p-6">
        <span className="mb-3 grid size-11 place-items-center rounded-xl bg-blue-100 text-[#1476cf]"><IconFileUpload size={23} aria-hidden="true" /></span>
        <h3 className="m-0 text-xl font-extrabold text-[#073b79]" id={`${slug}-documents-title`}>{config.title}</h3>
        <p className="mb-0 mt-2 max-w-3xl text-sm font-medium leading-6 text-[#607a98]">{config.description}</p>
      </header>

      <div className="grid gap-4 p-5 sm:p-6">
        {config.documents.map((document) => {
          const badge = badges[document.kind]
          return <article className="flex min-w-0 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4" key={document.name}><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-sm"><IconFile size={18} aria-hidden="true" /></span><div className="min-w-0"><span className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.06em] ${badge.className}`}>{badge.label}</span><h4 className="mb-0 mt-2 text-sm font-extrabold text-[#173f6e]">{document.name}</h4><p className="mb-0 mt-1 text-sm leading-6 text-slate-600">{document.description}</p></div></article>
        })}

        {config.note ? <aside className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><IconAlertCircle className="mt-0.5 shrink-0 text-amber-700" size={21} aria-hidden="true" /><div><strong className="text-sm text-amber-950">{config.note.title}</strong><p className="mb-0 mt-1 text-sm leading-6 text-amber-900">{config.note.description}</p></div></aside> : null}
        {config.secondaryNote ? <p className="m-0 flex gap-3 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-900"><IconInfoCircle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />{config.secondaryNote}</p> : null}

        {config.allowAttachments ? <div className="mt-1 border-t border-sky-100 pt-5"><label className="grid cursor-pointer gap-2 font-bold text-[#173f6e]">Elegir archivos<input {...inputProps} className="block w-full cursor-pointer rounded-xl border border-sky-200 bg-white p-3 text-sm font-medium file:mr-4 file:rounded-lg file:border-0 file:bg-sky-100 file:px-4 file:py-2 file:font-bold file:text-[#0b65b5]" name="documentos" type="file" multiple onChange={(event) => onFilesChange(Array.from(event.target.files ?? []))} /></label>{error}</div> : null}

        {files.length > 0 ? <ul className="m-0 grid list-none gap-3 p-0" aria-label="Archivos seleccionados">{files.map((file, index) => <li className="flex min-w-0 items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3" key={`${file.name}-${file.size}-${index}`}><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-emerald-600"><IconCheck size={19} aria-hidden="true" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-emerald-950">{file.name}</strong><small className="text-emerald-800">Tipo: {fileType(file)} · Estado: Listo para adjuntar</small></span><button className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-red-600 transition hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-500" type="button" aria-label={`Quitar ${file.name}`} onClick={() => onFilesChange(files.filter((_, fileIndex) => fileIndex !== index))}><IconTrash size={18} aria-hidden="true" /></button></li>)}</ul> : null}
      </div>
    </section>
  )
}

export default DocumentRequirements
