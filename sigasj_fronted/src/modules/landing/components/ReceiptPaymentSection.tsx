import { IconArrowRight, IconBuildingBank, IconBuildingStore, IconClock, IconDeviceMobile, IconMapPin } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import {
  DEFAULT_CONTACTO_UBICACION,
  getPublicContacto,
} from '../../contacto/services/contactoApi'
import { BANCO_NACIONAL_URL } from '../config/externalLinks'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import SectionHeader from '../../../shared/ui/SectionHeader'

const ReceiptPaymentSection = () => {
  const [sinpeTelefono, setSinpeTelefono] = useState(DEFAULT_CONTACTO_UBICACION.telefono)

  useEffect(() => {
    let cancelled = false
    void getPublicContacto()
      .then((contacto) => {
        if (!cancelled && contacto.telefono.trim()) {
          setSinpeTelefono(contacto.telefono.trim())
        }
      })
      .catch(() => {
        /* Conserva el teléfono institucional por defecto. */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section
      className="public-section public-section--surface"
      id="pagos"
      aria-labelledby="receipt-payment-title"
    >
      <div className="public-container">
        <Card className="flex flex-wrap items-center justify-between gap-6 p-6">
          <div className="min-w-0 flex-1">
            <SectionHeader
              id="receipt-payment-title"
              align="start"
              eyebrow="Consulta en línea"
              title="Consulta tu recibo"
              description="Revisa de forma rápida la información de tu recibo de agua."
            />
          </div>
          <Button
            to="/consulta-recibo"
            variant="primary"
            rightIcon={<IconArrowRight size={18} stroke={1.9} aria-hidden="true" />}
            className="shrink-0 max-[640px]:w-full"
            aria-describedby="receipt-payment-note"
          >
            Consultar recibo
          </Button>
          <p id="receipt-payment-note" className="sr-only">
            Haz clic en el botón para realizar la consulta en la plataforma de SIGASJ.
          </p>
        </Card>

        <div className="mt-8" aria-labelledby="payment-methods-title">
          <SectionHeader
            id="payment-methods-title"
            eyebrow="Opciones disponibles"
            title="Métodos de pago"
            description="Elige la alternativa que mejor se adapte a tus necesidades."
          />

          <div className="mt-6 grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
            <Card className="flex flex-col p-5">
              <div className="grid size-11 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
                <IconDeviceMobile size={20} stroke={1.85} aria-hidden="true" />
              </div>
              <h3 className="mb-0 mt-4 font-sigasj-display text-base font-bold text-sigasj-text">
                SINPE Móvil
              </h3>
              <p className="mb-0 mt-2 text-sm leading-6 text-sigasj-muted">
                Realiza el pago de tu recibo mediante SINPE Móvil al número indicado.
              </p>
              <p className="mt-4 mb-0 rounded-[10px] bg-sigasj-surface-soft px-4 py-3">
                <span className="block text-[12px] font-semibold uppercase tracking-wide text-sigasj-muted">
                  WhatsApp ASADA (SINPE)
                </span>
                <strong className="mt-1 block text-lg tracking-wide text-sigasj-primary">
                  {sinpeTelefono}
                </strong>
              </p>
              <p
                className="mb-0 mt-3 rounded-[10px] border border-sigasj-warning/40 bg-sigasj-surface-soft px-4 py-3 text-xs leading-5 text-sigasj-warning"
                role="note"
              >
                Todo pago realizado por SINPE Móvil debe confirmarse enviando el comprobante al
                WhatsApp de la ASADA San Juan.
              </p>
            </Card>

            <Card className="flex flex-col p-5">
              <div className="grid size-11 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
                <IconBuildingBank size={20} stroke={1.85} aria-hidden="true" />
              </div>
              <h3 className="mb-0 mt-4 font-sigasj-display text-base font-bold text-sigasj-text">
                Banco Nacional
              </h3>
              <p className="mb-0 mt-2 text-sm leading-6 text-sigasj-muted">
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
                className="mt-auto"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ir al Banco Nacional (abre una plataforma externa en una pestaña nueva)"
                rightIcon={<IconArrowRight size={16} stroke={1.9} aria-hidden="true" />}
              >
                Ir al Banco Nacional
              </Button>
            </Card>

            <Card className="flex flex-col p-5">
              <div className="grid size-11 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
                <IconBuildingStore size={20} stroke={1.85} aria-hidden="true" />
              </div>
              <h3 className="mb-0 mt-4 font-sigasj-display text-base font-bold text-sigasj-text">
                Ventanilla de la ASADA
              </h3>
              <p className="mb-0 mt-2 text-sm leading-6 text-sigasj-muted">
                Visita nuestra ventanilla para realizar el pago de forma presencial.
              </p>
              <dl className="mt-4 grid gap-2">
                <div className="relative rounded-[10px] bg-sigasj-surface-soft py-3 pl-12 pr-4">
                  <IconClock className="absolute left-4 top-4 text-sigasj-primary" size={18} stroke={1.85} aria-hidden="true" />
                  <dt className="text-[12px] font-semibold uppercase text-sigasj-muted">Horario</dt>
                  <dd className="m-0 mt-1 text-xs font-semibold text-sigasj-text">Lunes a sábado</dd>
                </div>
                <div className="relative rounded-[10px] bg-sigasj-surface-soft py-3 pl-12 pr-4">
                  <IconMapPin className="absolute left-4 top-4 text-sigasj-primary" size={18} stroke={1.85} aria-hidden="true" />
                  <dt className="text-[12px] font-semibold uppercase text-sigasj-muted">Atención</dt>
                  <dd className="m-0 mt-1 text-xs font-semibold text-sigasj-text">7:30 a. m. a 11:30 a. m.</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReceiptPaymentSection
