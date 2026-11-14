import { IconArrowRight, IconDropletExclamation } from '@tabler/icons-react'
import { REPORTAR_AVERIA_ROUTE_PATH } from '../../../app/router/routePaths'
import type { AccountSectionProps } from '../types/AccountSectionProps'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import SectionHeader from '../../../shared/ui/SectionHeader'

const AccountSection = ({ formHref = REPORTAR_AVERIA_ROUTE_PATH }: AccountSectionProps) => (
  <section
    className="public-section public-section--soft"
    id="reporte-averias"
    aria-labelledby="reporte-averias-title"
  >
    <div className="public-container">
      <Card className="flex flex-wrap items-center gap-6 p-6 max-[640px]:flex-col max-[640px]:items-stretch">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-[10px] bg-sigasj-surface text-sigasj-primary"
          aria-hidden="true"
        >
          <IconDropletExclamation size={24} stroke={1.85} />
        </span>
        <div className="min-w-0 flex-1">
          <SectionHeader
            id="reporte-averias-title"
            eyebrow="Atención de averías"
            title="Reportar una avería"
            description="Infórmanos sobre fugas, daños u otras averías en el servicio de agua para que podamos atenderlas oportunamente."
          />
        </div>
        <Button
          to={formHref}
          variant="primary"
          rightIcon={<IconArrowRight size={18} stroke={1.9} aria-hidden="true" />}
          className="shrink-0 max-[640px]:w-full"
        >
          Reportar avería
        </Button>
      </Card>
    </div>
  </section>
)

export default AccountSection
