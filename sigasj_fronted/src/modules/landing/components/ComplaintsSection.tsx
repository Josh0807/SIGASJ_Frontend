import { IconArrowRight, IconMail } from '@tabler/icons-react'
import { Button, Card, SectionHeader } from '../../../shared/ui'

const ComplaintsSection = () => (
  <section
    className="public-section public-section--tight public-section--canvas"
    id="quejas"
    aria-labelledby="quejas-title"
  >
    <div className="public-container">
      <div data-aos="fade-up">
      <Card className="transparency-motion-card flex flex-wrap items-center gap-6 p-6 max-[640px]:flex-col max-[640px]:items-stretch">
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
            animate={false}
          />
        </div>
        <Button
          to="/formulario-quejas"
          variant="primary"
          rightIcon={<IconArrowRight size={18} stroke={1.9} aria-hidden="true" />}
          className="landing-lift-button landing-lift-button--solid shrink-0 max-[640px]:w-full"
        >
          Enviar sugerencia o queja
        </Button>
      </Card>
      </div>
    </div>
  </section>
)

export default ComplaintsSection
