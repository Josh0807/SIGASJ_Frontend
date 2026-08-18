const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
}

export const ChevronRightIcon = () => (
  <svg {...iconProps}>
    <path
      d="M6 3.5 10.5 8 6 12.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const ChevronLeftIcon = () => (
  <svg {...iconProps}>
    <path
      d="M10 3.5 5.5 8 10 12.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const DocumentIcon = () => (
  <svg {...iconProps}>
    <path
      d="M4.5 2.5h4.2L11.5 5.3V13a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M8 2.5V5.5H11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

export const AlertIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path
      d="M11 3 19 18H3L11 3Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M11 9v4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="11" cy="16.2" r="0.9" fill="currentColor" />
  </svg>
)

export const EmptyInboxIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <rect
      x="3.5"
      y="6.5"
      width="15"
      height="11"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M3.5 8.5 11 12.8 18.5 8.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
)
