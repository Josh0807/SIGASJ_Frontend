type SectionHeaderProps = {
  id?: string
  eyebrow?: string
  title: string
  description?: string
  className?: string
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  className = '',
}: SectionHeaderProps) {
  return (
    <header className={`max-w-[720px] ${className}`.trim()}>
      {eyebrow ? (
        <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-sigasj-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className="m-0 font-sigasj-display text-[clamp(1.7rem,3.2vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.02em] text-sigasj-text"
      >
        {title}
      </h2>
      {description ? (
        <p className="mb-0 mt-4 text-base leading-[1.65] text-sigasj-muted">
          {description}
        </p>
      ) : null}
    </header>
  )
}

export default SectionHeader
