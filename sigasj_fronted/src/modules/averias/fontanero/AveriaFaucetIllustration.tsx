import { useId } from 'react'

/** Ilustración de esquina: tubo en L + llave de paso + gota (mock). */
export default function AveriaFaucetIllustration({
  className = '',
}: {
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const pipeGrad = `pipe-${uid}`
  const shineGrad = `shine-${uid}`
  const dropGrad = `drop-${uid}`
  const dripAnim = `drip-${uid}`

  return (
    <span className={`block ${className}`.trim()} aria-hidden="true">
      <svg
        className="h-full w-full"
        viewBox="0 0 260 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
      >
        <defs>
          <linearGradient
            id={pipeGrad}
            x1="30"
            y1="100"
            x2="250"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#7EC8F8" />
            <stop offset="55%" stopColor="#5BB6F5" />
            <stop offset="100%" stopColor="#B6E0FB" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient
            id={shineGrad}
            x1="0"
            y1="88"
            x2="0"
            y2="118"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={dropGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4AA3E7" />
            <stop offset="100%" stopColor="#1B75D0" />
          </linearGradient>
          <style>{`
            @keyframes ${dripAnim} {
              0%, 100% { transform: translateY(0); opacity: 1; }
              50% { transform: translateY(4px); opacity: 0.88; }
            }
            .d-${uid} {
              transform-origin: 155px 158px;
              animation: ${dripAnim} 2.6s ease-in-out infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .d-${uid} { animation: none; }
            }
          `}</style>
        </defs>

        <ellipse cx="148" cy="130" rx="78" ry="52" fill="#BAE6FD" opacity="0.28" />
        <path
          d="M70 148 C110 138 150 158 200 142"
          stroke="#93C5FD"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.28"
        />

        {/* Tubo L — tramo horizontal más bajo para que la llave se vea */}
        <path
          d="M48 210 V128 C48 100 68 86 96 86 H246"
          stroke="#1B75D0"
          strokeWidth="42"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.12"
        />
        <path
          d="M48 210 V128 C48 100 68 86 96 86 H246"
          stroke={`url(#${pipeGrad})`}
          strokeWidth="36"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M92 74 H220"
          stroke={`url(#${shineGrad})`}
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M48 142 V200"
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Bridas */}
        <rect
          x="118"
          y="68"
          width="15"
          height="40"
          rx="4"
          fill="#2F8FD9"
          stroke="#155FA8"
          strokeWidth="2"
        />
        <rect
          x="178"
          y="68"
          width="15"
          height="40"
          rx="4"
          fill="#2F8FD9"
          stroke="#155FA8"
          strokeWidth="2"
        />

        {/* Cuerpo llave */}
        <rect
          x="133"
          y="66"
          width="45"
          height="44"
          rx="8"
          fill="#1B75D0"
          stroke="#0E5AAB"
          strokeWidth="2.4"
        />
        <rect
          x="141"
          y="74"
          width="8"
          height="28"
          rx="3"
          fill="#72C3F9"
          opacity="0.45"
        />

        {/* Tallo */}
        <rect
          x="146"
          y="46"
          width="18"
          height="24"
          rx="5"
          fill="#2F8FD9"
          stroke="#0E5AAB"
          strokeWidth="2.2"
        />

        {/* Manija */}
        <rect
          x="126"
          y="36"
          width="58"
          height="16"
          rx="8"
          fill="#155FA8"
          stroke="#0E5AAB"
          strokeWidth="2.2"
        />
        <rect
          x="149"
          y="32"
          width="12"
          height="12"
          rx="4"
          fill="#4AA3E7"
          stroke="#0E5AAB"
          strokeWidth="1.8"
        />

        {/* Gota */}
        <g className={`d-${uid}`}>
          <path
            d="M155 128 C155 128 138 146 138 158 C138 168 145.5 175 155 175 C164.5 175 172 168 172 158 C172 146 155 128 155 128 Z"
            fill={`url(#${dropGrad})`}
            stroke="#0E5AAB"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M147 156 C149 149 152 144 156 140"
            stroke="#E8F6FF"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </span>
  )
}
