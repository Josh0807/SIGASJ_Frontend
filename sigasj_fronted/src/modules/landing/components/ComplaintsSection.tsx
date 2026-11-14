import { IconArrowRight, IconMail } from '@tabler/icons-react'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import SectionHeader from '../../../shared/ui/SectionHeader'

const ComplaintsSection = () => (
  <section
    className="public-section public-section--canvas"
    id="quejas"
    aria-labelledby="quejas-title"
  >
    <div className="public-container">
      <Card className="flex flex-wrap items-center gap-6 p-6 max-[640px]:flex-col max-[640px]:items-stretch">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary"
          aria-hidden="true"
        >
          <IconMail size={22} stroke={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <SectionHeader
            id="quejas-title"
            align="start"
            eyebrow="Atención al usuario"
            title="Sugerencias y quejas"
            description="Envíanos tus sugerencias y quejas completando el formulario para brindarte la atención correspondiente."
          />
        </div>
        <div className="shrink-0 max-[640px]:w-full">
          <Button
            to="/formulario-quejas"
            variant="secondary"
            rightIcon={<IconArrowRight size={18} stroke={1.9} aria-hidden="true" />}
            className="max-[640px]:w-full"
          >
            Enviar sugerencia o queja
          </Button>
          <p className="mb-0 mt-2 max-w-xs text-[12px] leading-5 text-sigasj-muted max-[640px]:max-w-none">
            Se abre el formulario en línea de la ASADA.
          </p>
        </div>
      </Card>
    </div>
  </section>
)

export default ComplaintsSection
