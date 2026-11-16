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
      className="transparency-motion-card flex h-full flex-col rounded-[18px] border border-sigasj-border bg-sigasj-surface p-6 shadow-[0_4px_14px_rgba(16,43,56,0.05)] max-[640px]:p-5"
      data-transparency-id={id}
      data-file-type={fileType}
      aria-labelledby={titleId}
    >
      <div className="grid size-14 place-items-center rounded-[14px] bg-sigasj-surface-soft text-sigasj-primary">
        {isDocument ? (
          <IconFileDescription size={28} stroke={1.8} aria-hidden="true" />
        ) : (
          <IconPhoto size={28} stroke={1.8} aria-hidden="true" />
        )}
      </div>

      <h3 className="public-card-title mt-5 text-[1.35rem] leading-snug max-[640px]:text-[1.2rem]" id={titleId}>
        {safeName}
      </h3>
      <p className="public-card-text mt-2.5 line-clamp-3 whitespace-pre-line text-[1rem] leading-relaxed max-[640px]:text-[0.9375rem]">
        {safeDescription}
      </p>

      <footer className="mt-auto pt-5">
        <a
          className="transparency-motion-button inline-flex min-h-11 w-fit items-center gap-2 rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-4 text-xs font-semibold text-sigasj-primary-hover no-underline transition-colors duration-150 hover:border-sigasj-primary hover:bg-sigasj-surface-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sigasj-sky"
          href={safeFileUrl}
          target={TRANSPARENCY_FILE_LINK_TARGET}
          rel={TRANSPARENCY_FILE_LINK_REL}
        >
          {actionLabel} <IconArrowRight size={18} aria-hidden="true" />
        </a>
        <p className="public-caption mb-0 mt-3 flex items-center gap-2 text-[0.9rem]">
          {isDocument ? (
            <IconFileDescription size={18} aria-hidden="true" />
          ) : (
            <IconPhoto size={18} aria-hidden="true" />
          )}
          {isDocument ? 'Documento oficial' : 'Imagen oficial'}
        </p>
      </footer>
    </article>
  )
}

export default TransparencyCard
