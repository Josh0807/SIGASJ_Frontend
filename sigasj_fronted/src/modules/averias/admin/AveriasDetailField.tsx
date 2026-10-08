import type { ReactNode } from 'react'

type AveriasDetailFieldProps = {
  label: string
  children: ReactNode
  multiline?: boolean
  modern?: boolean
}

const AveriasDetailField = ({
  label,
  children,
  multiline = false,
  modern = false,
}: AveriasDetailFieldProps) => (
  <div
    className={`${multiline ? 'averias-admin__field is-multiline' : 'averias-admin__field'} ${
      modern
        ? 'group !rounded-2xl !border !border-blue-100 !bg-white/90 !p-5 !shadow-[0_7px_18px_rgba(30,90,156,0.07)] !transition-all !duration-300 hover:!-translate-y-1 hover:!border-blue-200 hover:!shadow-[0_13px_26px_rgba(30,90,156,0.13)]'
        : ''
    }`}
  >
    <dt className={modern ? '!mb-2 !text-xs !font-extrabold !uppercase !tracking-[0.08em] !text-blue-600' : undefined}>{label}</dt>
    <dd className={`${multiline ? 'averias-admin__prewrap' : ''} ${modern ? '!m-0 !text-base !font-bold !leading-relaxed !text-[#073b73]' : ''}`.trim() || undefined}>{children}</dd>
  </div>
)

export default AveriasDetailField
