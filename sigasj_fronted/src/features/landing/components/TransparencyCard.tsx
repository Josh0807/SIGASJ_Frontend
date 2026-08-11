import type {
  TransparencyCardProps,
} from '../props/TransparencySectionProps'
import {
  getTransparencyActionLabel,
  TRANSPARENCY_FILE_LINK_REL,
  TRANSPARENCY_FILE_LINK_TARGET,
} from './transparencyCard.utils'

/**
 * Tarjeta reutilizable de una publicación de transparencia.
 */
const TransparencyCard = ({
  id,
  name,
  description,
  fileUrl,
  fileType,
}: TransparencyCardProps) => {
  const safeName = typeof name === 'string' ? name.trim() : ''
  const safeDescription =
    typeof description === 'string' ? description.trim() : ''
  const safeFileUrl = typeof fileUrl === 'string' ? fileUrl.trim() : ''

  if (!safeName || !safeDescription || !safeFileUrl) {
    return null
  }

  const titleId = `transparency-title-${id}`
  const actionLabel = getTransparencyActionLabel(fileType)

  return (
    <article
      className="transparency-section__card"
      data-transparency-id={id}
      data-file-type={fileType}
      aria-labelledby={titleId}
    >
      <h3 className="transparency-section__title" id={titleId}>
        {safeName}
      </h3>

      <p className="transparency-section__description">{safeDescription}</p>

      <footer className="transparency-section__card-actions">
        <a
          className="transparency-section__action"
          href={safeFileUrl}
          target={TRANSPARENCY_FILE_LINK_TARGET}
          rel={TRANSPARENCY_FILE_LINK_REL}
        >
          {actionLabel}
        </a>
      </footer>
    </article>
  )
}

export default TransparencyCard
