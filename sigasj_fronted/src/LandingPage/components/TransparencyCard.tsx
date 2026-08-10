import type {
  TransparencyCardProps,
  TransparencyFileType,
} from '../Props/TransparencySectionProps'

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
  const actionLabel = getActionLabel(fileType)

  return (
    <article
      className="transparency-section__card"
      data-transparency-id={id}
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
          target="_blank"
          rel="noopener noreferrer"
        >
          {actionLabel}
        </a>
      </footer>
    </article>
  )
}

const getActionLabel = (fileType: TransparencyFileType) => {
  if (fileType === 'pdf') {
    return 'Ver documento'
  }

  return 'Ver imagen'
}

export default TransparencyCard
