type StatusBadgeTone = 'neutral' | 'urgent' | 'success' | 'accent'

type StatusBadgeProps = {
  children: string
  tone?: StatusBadgeTone
  className?: string
}

const toneClass: Record<StatusBadgeTone, string> = {
  neutral: 'bg-sigasj-surface-soft text-sigasj-primary-hover',
  urgent: 'bg-[#f8e8e8] text-sigasj-error',
  success: 'bg-[#e6f2ed] text-sigasj-success',
  accent: 'bg-sigasj-surface-soft text-sigasj-accent',
}

export function StatusBadge({
  children,
  tone = 'neutral',
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[12px] font-semibold leading-none ${toneClass[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  )
}

export default StatusBadge
