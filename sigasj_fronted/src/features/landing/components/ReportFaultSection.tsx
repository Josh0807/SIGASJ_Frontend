import AccountSection from './AccountSection'

export type ReportFaultSectionProps = {
  formHref?: string
}

/** Acceso público al reporte de averías en la Landing Page. */
const ReportFaultSection = ({ formHref }: ReportFaultSectionProps) => (
  <AccountSection formHref={formHref} />
)

export default ReportFaultSection
