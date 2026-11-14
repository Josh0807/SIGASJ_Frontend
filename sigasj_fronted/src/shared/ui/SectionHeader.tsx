type SectionHeaderProps = {
  id?: string
  eyebrow?: string
  title: string
  description?: string
  className?: string
  /** Default: centered (landing). Use `start` for CTA strips with side actions. */
  align?: 'center' | 'start'
  /** Reveal on scroll (AOS). Default true. */
  animate?: boolean
  aosDelay?: number
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  className = '',
  align = 'center',
  animate = true,
  aosDelay = 0,
}: SectionHeaderProps) {
  const isCentered = align === 'center'

  return (
    <header
      className={[
        'w-full max-w-[720px]',
        isCentered ? 'mx-auto text-center' : 'text-left',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...(animate
        ? {
            'data-aos': 'fade-up',
            'data-aos-delay': String(aosDelay),
          }
        : {})}
    >
      {eyebrow ? (
        <p
          className={[
            'public-eyebrow',
            isCentered ? 'inline-block [margin-inline-end:-0.12em]' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className={['public-section-title', isCentered ? 'mx-auto' : '']
          .filter(Boolean)
          .join(' ')}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={[
            'public-section-intro',
            isCentered ? 'mx-auto' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {description}
        </p>
      ) : null}
    </header>
  )
}

export default SectionHeader
