import { IconArrowRight, IconFileDescription, IconPhoto } from '@tabler/icons-react'
import type { TransparencyCardProps } from './TransparencySectionProps'
import {
  getTransparencyActionLabel,
  TRANSPARENCY_FILE_LINK_REL,
  TRANSPARENCY_FILE_LINK_TARGET,
} from './transparencyCard.utils'

const TransparencyCard = ({ id, name, description, fileUrl, fileType }: TransparencyCardProps) => {
  const safeName = typeof name === 'string' ? name.trim() : ''
  const safeDescription = typeof description === 'string' ? description.trim() : ''
  const safeFileUrl = typeof fileUrl === 'string' ? fileUrl.trim() : ''

  if (!safeName || !safeDescription || !safeFileUrl) return null

  const titleId = `transparency-title-${id}`
  const actionLabel = getTransparencyActionLabel(fileType)
  const isDocument = fileType === 'pdf'

  return (
    <article
      className="transparency-motion-card relative grid min-h-[280px] grid-cols-[150px_minmax(0,1fr)] gap-8 overflow-hidden rounded-[24px] border border-white bg-white/90 px-9 py-8 shadow-[0_14px_32px_rgba(39,112,166,0.13)] backdrop-blur-sm max-[700px]:min-h-0 max-[700px]:grid-cols-1 max-[700px]:gap-5 max-[700px]:px-6 max-[700px]:py-6"
      data-transparency-id={id}
      data-file-type={fileType}
      aria-labelledby={titleId}
    >
      <div className="relative z-10 grid size-[120px] place-items-center self-start rounded-[22px] bg-gradient-to-br from-[#edf8ff] to-[#dceffd] text-[#3296df] max-[700px]:size-20">
        {isDocument ? <IconFileDescription size={62} stroke={1.8} aria-hidden="true" /> : <IconPhoto size={62} stroke={1.8} aria-hidden="true" />}
      </div>

      <div className="relative z-10 flex min-w-0 flex-col items-start">
        <h3 className="m-0 text-2xl font-extrabold leading-tight text-[#073b79] max-[700px]:text-xl" id={titleId}>{safeName}</h3>
        <p className="mb-0 mt-4 max-w-[760px] line-clamp-3 whitespace-pre-line text-base leading-7 text-[#526d8c]">{safeDescription}</p>

        <footer className="mt-auto pt-5">
          <a
            className="transparency-motion-button inline-flex min-h-12 items-center gap-8 rounded-xl border border-[#0872d3] bg-white px-6 text-sm font-bold text-[#0869bd] no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            href={safeFileUrl}
            target={TRANSPARENCY_FILE_LINK_TARGET}
            rel={TRANSPARENCY_FILE_LINK_REL}
          >
            {actionLabel} <IconArrowRight size={20} aria-hidden="true" />
          </a>
          <p className="mb-0 mt-4 flex items-center gap-2 text-xs font-medium text-[#607a98]">
            {isDocument ? <IconFileDescription size={18} aria-hidden="true" /> : <IconPhoto size={18} aria-hidden="true" />}
            {isDocument ? 'Documento oficial' : 'Imagen oficial'}
          </p>
        </footer>
      </div>

      <span className="pointer-events-none absolute -right-20 -bottom-20 h-36 w-[420px] -rotate-6 rounded-[50%] bg-sky-200/35" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-24 -bottom-24 h-36 w-[460px] rotate-3 rounded-[50%] border-[24px] border-sky-300/15" aria-hidden="true" />
    </article>
  )
}

export default TransparencyCard
