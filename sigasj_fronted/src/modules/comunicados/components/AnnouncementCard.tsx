import { Link } from 'react-router-dom'
import { IconArrowRight } from '@tabler/icons-react'
import type { AnnouncementCardProps } from '../types/AnnouncementsSectionProps'

const AnnouncementCard = ({
  id,
  title,
  summary,
  content,
  publishedAt,
  type,
  urgent = false,
  moreHref,
  moreLabel = 'Consultar detalle',
  onMoreClick,
  imageUrl,
  fileUrl,
  onImageClick,
}: AnnouncementCardProps) => {
  const safeTitle = typeof title === 'string' ? title.trim() : ''
  if (!safeTitle) {
    return null
  }

  const safeSummary = typeof summary === 'string' ? summary.trim() : ''
  const safeContent = typeof content === 'string' ? content.trim() : ''
  const bodyText = safeSummary || safeContent

  const safeType = typeof type === 'string' ? type.trim() : ''
  const safeImageUrl = asPublicAssetUrl(imageUrl)
  const safeFileUrl = asPublicAssetUrl(fileUrl)
  const safeMoreHref = asPublicAssetUrl(moreHref)
  const safePublishedAt =
    typeof publishedAt === 'string' ? publishedAt.trim() : ''
  const formattedDate = safePublishedAt
    ? formatAnnouncementDate(safePublishedAt)
    : undefined

  const titleId = `announcement-title-${id}`
  const showMeta = Boolean(safeType || formattedDate || urgent)

  const cardClassName = `flex h-full min-h-[320px] flex-col overflow-hidden rounded-[18px] border-[3px] bg-white shadow-none transition hover:-translate-y-0.5 hover:shadow-none ${urgent ? 'border-amber-300' : 'border-white'}`

  const imageAlt = `Ilustración del comunicado: ${safeTitle}`

  return (
    <article
      className={cardClassName}
      data-announcement-id={id}
      aria-labelledby={titleId}
    >
      {safeImageUrl ? (
        <div className="m-0.5 aspect-[2.35/1] overflow-hidden rounded-[14px] bg-[#eef8ff]">
          <button
            type="button"
            className="block h-full w-full cursor-zoom-in border-0 bg-transparent p-0 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-sky-400"
            aria-label={`Ver imagen ampliada: ${safeTitle}`}
            onClick={onImageClick}
          >
            <img
              className="h-full w-full object-contain transition duration-500 hover:scale-[1.01]"
              src={safeImageUrl}
              alt={imageAlt}
              loading="lazy"
              decoding="async"
            />
          </button>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col px-5 pb-4 pt-3 max-[640px]:px-4">
        {showMeta ? (
          <p className="m-0 mb-1.5 flex flex-wrap items-center gap-x-2 text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-[#1874c8]">
            {safeType ? <span>{safeType}</span> : null}
            {formattedDate ? (
              <time dateTime={safePublishedAt}>{formattedDate}</time>
            ) : null}
            {urgent ? (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">
                Prioridad alta
              </span>
            ) : null}
          </p>
        ) : null}

        <h3 className="m-0 text-[1.05rem] font-extrabold leading-tight text-[#092e67]" id={titleId}>
          {safeTitle}
        </h3>

        {bodyText && !safeImageUrl ? (
          <p className="mb-0 mt-3 line-clamp-3 text-sm leading-6 text-[#496b78]">{bodyText}</p>
        ) : null}

        <footer className="mt-auto flex flex-wrap gap-3 pt-3">
          {safeImageUrl ? (
            <button
              type="button"
              className="announcement-motion-button inline-flex min-h-9 cursor-pointer items-center gap-4 rounded-[10px] border border-[#0872d3] bg-white px-5 text-xs font-bold text-[#0869bd] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
              onClick={onImageClick}
            >
              Ver imagen <IconArrowRight size={18} aria-hidden="true" />
            </button>
          ) : null}

          {!safeImageUrl && (safeMoreHref || typeof onMoreClick === 'function') ? (
            <CardAction
              label={moreLabel}
              href={safeMoreHref}
              onClick={onMoreClick}
            />
          ) : null}

          {safeFileUrl ? (
            <a
              className="announcement-motion-button inline-flex min-h-10 items-center rounded-xl border border-sky-200 px-5 text-sm font-bold text-[#0869bd] no-underline"
              href={safeFileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver documento
            </a>
          ) : null}
        </footer>
      </div>
    </article>
  )
}

type CardActionProps = {
  label: string
  href?: string
  onClick?: () => void
}

const isInternalSpaPath = (href: string) =>
  href.startsWith('/') && !href.startsWith('//')

const cardActionClassName = 'announcement-motion-button inline-flex min-h-10 items-center rounded-xl border border-[#0872d3] bg-white px-5 text-sm font-bold text-[#0869bd] no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400'

const CardAction = ({ label, href, onClick }: CardActionProps) => {
  if (href) {
    if (isInternalSpaPath(href)) {
      return (
        <Link className={cardActionClassName} to={href}>
          {label}
        </Link>
      )
    }

    return (
      <a className={cardActionClassName} href={href}>
        {label}
      </a>
    )
  }

  if (typeof onClick === 'function') {
    return (
      <button
        type="button"
        className={cardActionClassName}
        onClick={onClick}
      >
        {label}
      </button>
    )
  }

  return null
}

const asPublicAssetUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return undefined
  }

  return trimmed
}

const formatAnnouncementDate = (value: string): string | undefined => {
  const trimmed = value.trim()
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)

  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(trimmed)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return new Intl.DateTimeFormat('es-CR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export default AnnouncementCard
