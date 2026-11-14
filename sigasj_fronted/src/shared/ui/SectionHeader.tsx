type SectionHeaderProps = {
  id?: string
  eyebrow?: string
  title: string
  description?: string
  className?: string
  /** Default: centered (landing). Use `start` for CTA strips with side actions. */
  align?: 'center' | 'start'
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  className = '',
  align = 'center',
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
    >
      {eyebrow ? (
        <p
          className={[
            'mb-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-sigasj-primary',
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
            'mb-0 mt-4 text-base leading-[1.65] text-pretty text-sigasj-muted',
            isCentered ? 'mx-auto max-w-[36rem]' : '',
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
