import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconBuildingBank,
  IconBuildingStore,
  IconClock,
  IconDeviceMobile,
  IconReceipt,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import {
  DEFAULT_CONTACTO_UBICACION,
  getPublicContacto,
} from '../../contacto/services/contactoApi'
import { BANCO_NACIONAL_URL } from '../config/externalLinks'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import SectionHeader from '../../../shared/ui/SectionHeader'

const PaymentFact = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
}) => (
  <div className="min-w-0">
    <p className="mb-1 flex min-w-0 items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.11em] text-sigasj-muted">
      <span className="shrink-0 text-sigasj-primary" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 break-words">{label}</span>
    </p>
    <div className="min-w-0 break-words text-[1.05rem] font-semibold leading-snug text-sigasj-text">
      {value}
    </div>
  </div>
)

const ReceiptPaymentSection = () => {
  const [sinpeTelefono, setSinpeTelefono] = useState(DEFAULT_CONTACTO_UBICACION.telefono)
  const [horarioAtencion, setHorarioAtencion] = useState(
    DEFAULT_CONTACTO_UBICACION.horarioAtencion,
  )

  useEffect(() => {
    let cancelled = false
    void getPublicContacto()
      .then((contacto) => {
        if (cancelled) return
        if (contacto.telefono.trim()) {
          setSinpeTelefono(contacto.telefono.trim())
        }
        if (contacto.horarioAtencion.trim()) {
          setHorarioAtencion(contacto.horarioAtencion.trim())
        }
      })
      .catch(() => {
        /* Conserva teléfono y horario institucionales por defecto. */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section
      className="public-section public-section--tight public-section--surface"
      id="pagos"
      aria-labelledby="receipt-payment-title"
    >
      <div className="public-container">
        <div data-aos="fade-up">
        <Card className="transparency-motion-card flex min-w-0 flex-wrap items-center gap-6 overflow-hidden p-6 max-[640px]:flex-col max-[640px]:items-stretch">
          <span
            className="grid size-12 shrink-0 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary"
            aria-hidden="true"
          >
            <IconReceipt size={22} stroke={1.85} />
          </span>
          <div className="min-w-0 flex-1">
            <SectionHeader
              id="receipt-payment-title"
              align="start"
              eyebrow="Consulta en línea"
              title="Consulta tu recibo"
              description="Revisa de forma rápida la información de tu recibo de agua."
              animate={false}
            />
          </div>
          <Button
            to="/consulta-recibo"
            variant="primary"
            rightIcon={<IconArrowRight size={18} stroke={1.9} aria-hidden="true" />}
            className="landing-lift-button landing-lift-button--solid shrink-0 whitespace-normal max-[640px]:w-full"
            aria-describedby="receipt-payment-note"
          >
            Consultar recibo
          </Button>
          <p id="receipt-payment-note" className="sr-only">
            Haz clic en el botón para realizar la consulta en la plataforma de SIGASJ.
          </p>
        </Card>
        </div>

        <div className="mt-12" aria-labelledby="payment-methods-title">
          <SectionHeader
            id="payment-methods-title"
            eyebrow="Opciones disponibles"
            title="Métodos de pago"
            description="Elige la alternativa que mejor se adapte a tus necesidades."
          />

          <div className="mt-6 grid grid-cols-3 items-stretch gap-3 max-[900px]:grid-cols-1">
            <div className="min-w-0" data-aos="fade-up" data-aos-delay="40">
            <Card className="transparency-motion-card flex h-full min-w-0 flex-col overflow-hidden p-5">
              <div className="grid size-11 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
                <IconDeviceMobile size={20} stroke={1.85} aria-hidden="true" />
              </div>
              <h3 className="public-card-title mt-4">SINPE Móvil</h3>
              <p className="public-card-text mt-2">
                Realiza el pago de tu recibo mediante SINPE Móvil al número indicado.
              </p>
              <div className="mt-5 min-w-0">
                <PaymentFact
                  icon={<IconBrandWhatsapp size={15} stroke={1.9} />}
                  label="WhatsApp ASADA (SINPE)"
                  value={
                    <span className="break-words text-[1.25rem] tracking-wide text-sigasj-primary">
                      {sinpeTelefono}
                    </span>
                  }
                />
                <p className="public-caption mb-0 mt-3 text-sigasj-warning" role="note">
                  Confirma el pago enviando el comprobante al WhatsApp de la ASADA.
                </p>
              </div>
            </Card>
            </div>

            <div className="min-w-0" data-aos="fade-up" data-aos-delay="100">
            <Card className="transparency-motion-card flex h-full min-w-0 flex-col overflow-hidden p-5">
              <div className="grid size-11 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
                <IconBuildingBank size={20} stroke={1.85} aria-hidden="true" />
              </div>
              <h3 className="public-card-title mt-4">Banco Nacional</h3>
              <p className="public-card-text mt-2">
                Paga por medio de los canales disponibles del Banco Nacional.
              </p>
              <ul className="mt-4 mb-4 grid list-disc gap-1 pl-5 text-sm text-sigasj-muted">
                <li>Banca en línea</li>
                <li>Aplicación móvil</li>
                <li>Sucursales</li>
              </ul>
              <Button
                href={BANCO_NACIONAL_URL}
                variant="secondary"
                size="sm"
                className="transparency-motion-button mt-auto w-full min-w-0 whitespace-normal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ir al Banco Nacional (abre una plataforma externa en una pestaña nueva)"
                rightIcon={<IconArrowRight size={16} stroke={1.9} aria-hidden="true" />}
              >
                Ir al Banco Nacional
              </Button>
            </Card>
            </div>

            <div className="min-w-0" data-aos="fade-up" data-aos-delay="160">
            <Card className="transparency-motion-card @container flex h-full min-w-0 flex-col overflow-hidden p-5">
              <div className="grid size-11 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
                <IconBuildingStore size={20} stroke={1.85} aria-hidden="true" />
              </div>
              <h3 className="public-card-title mt-4">Ventanilla de la ASADA</h3>
              <p className="public-card-text mt-2">
                Visita nuestra ventanilla para realizar el pago de forma presencial.
              </p>
              <div className="mt-5">
                <PaymentFact
                  icon={<IconClock size={15} stroke={1.9} />}
                  label="Horario de atención"
                  value={horarioAtencion}
                />
              </div>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReceiptPaymentSection
