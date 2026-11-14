type SageGotinProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/** Mascota visual de Sage: gotín con ojitos y sonrisa. */
const SageGotin = ({ className = '', size = 'md' }: SageGotinProps) => (
  <span
    className={`sage-ia__gotin sage-ia__gotin--${size}${className ? ` ${className}` : ''}`}
    aria-hidden="true"
  >
    <span className="sage-ia__gotin-shine" />
    <span className="sage-ia__gotin-blush sage-ia__gotin-blush--left" />
    <span className="sage-ia__gotin-blush sage-ia__gotin-blush--right" />
    <span className="sage-ia__gotin-face">
      <span className="sage-ia__gotin-eye" />
      <span className="sage-ia__gotin-eye" />
    </span>
    <span className="sage-ia__gotin-smile" />
  </span>
)

export default SageGotin
