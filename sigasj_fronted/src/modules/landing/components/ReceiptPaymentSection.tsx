import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

import whatsappLogo from '../../../assets/LogoWhatsApp.png'
import { whatsappHrefFromPhone } from '../../contacto/types/contacto.types'
import { BANCO_NACIONAL_URL } from '../config/externalLinks'

type PaymentMethod = {
  id: 'sinpe' | 'banco-nacional' | 'ventanilla'
  name: string
  description: string
  icon: ReactNode
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'sinpe',
    name: 'SINPE Móvil',
    description: 'Realiza el pago de tu recibo mediante SINPE Móvil al número indicado.',
    icon: (
      <path d="M8 3.5h8a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Zm1 3h6m-4 11h2M8.5 10h7m-3.5-2.5V13" />
    ),
  },
  {
    id: 'banco-nacional',
    name: 'Banco Nacional',
    description: 'Paga por medio de los canales disponibles del Banco Nacional.',
    icon: (
      <>
        <path d="m3 9 9-5 9 5M5 10h14M6.5 10v7m3.5-7v7m4-7v7m3.5-7v7M4 20h16" />
      </>
    ),
  },
  {
    id: 'ventanilla',
    name: 'Ventanilla de la ASADA',
    description: 'Visita nuestra ventanilla para realizar el pago de forma presencial.',
    icon: (
      <>
        <path d="M4 20V7l8-4 8 4v13M8 20v-5h8v5M8 9h.01M12 9h.01M16 9h.01" />
      </>
    ),
  },
]

const PaymentIcon = ({ name, children }: { name: string; children: ReactNode }) => (
  <svg
    className="receipt-payment__icon"
    viewBox="0 0 24 24"
    role="img"
    aria-label={`Ícono de ${name}`}
    focusable="false"
  >
    {children}
  </svg>
)

const ReceiptPaymentSection = ({
  telefono = '8560-7584',
  ventanillaHours = 'Lunes a sábado de 7:30 a.m. – 11:30 a.m.',
  layout = 'standalone',
}: {
  telefono?: string
  ventanillaHours?: string
  layout?: 'standalone' | 'hub'
}) => {
  const navigate = useNavigate()
  const whatsappUrl = whatsappHrefFromPhone(telefono)
  const isHub = layout === 'hub'
  const RootTag = isHub ? 'div' : 'section'
  const sectionTitleId = 'pagos-title'
  const consultationTitleId = 'pagos-consulta-title'
  const methodsTitleId = 'pagos-methods-title'

  return (
    <RootTag
      className={`receipt-payment${isHub ? ' receipt-payment--hub' : ' landing-section'}`}
      id="pagos"
      aria-labelledby={sectionTitleId}
    >
      <div className="receipt-payment__content">
        {isHub ? (
          <header className="landing-section__subheading">
            <h3 id={sectionTitleId}>Recibos y métodos de pago</h3>
            <p className="landing-section__lead">
              Consulta tu recibo en línea y elige la forma de pago que prefieras.
            </p>
          </header>
        ) : null}

        <article
          className="receipt-payment__consultation"
          aria-labelledby={consultationTitleId}
        >
          <div>
            {!isHub ? (
              <header className="landing-section__heading landing-section__heading--inverse">
                <p className="landing-eyebrow landing-eyebrow--inverse">Consulta en línea</p>
                <h2 id={sectionTitleId}>Consulta tu recibo</h2>
              </header>
            ) : (
              <h4 id={consultationTitleId} className="receipt-payment__panel-title">
                Consulta en línea
              </h4>
            )}
            <p>Revisa de forma rápida la información de tu recibo de agua.</p>
          </div>
          <div className="receipt-payment__action">
            <button
              type="button"
              className="receipt-payment__button"
              onClick={() => navigate('/consulta-recibo')}
            >
              Consultar recibo <span aria-hidden="true">&#8594;</span>
            </button>
            <p id="receipt-payment-note" className="receipt-payment__external-note">
              Haz clic en el botón para realizar la consulta en la plataforma de SIGASJ.
            </p>
          </div>
        </article>

        <div className="receipt-payment__methods" aria-labelledby={methodsTitleId}>
          <header className="receipt-payment__heading">
            {!isHub ? (
              <>
                <p className="landing-eyebrow">Opciones disponibles</p>
                <h2 id={methodsTitleId}>Métodos de pago</h2>
              </>
            ) : (
              <h4 id={methodsTitleId} className="receipt-payment__panel-title">
                Métodos de pago
              </h4>
            )}
            <p className="landing-section__lead">
              Elige la alternativa que mejor se adapte a tus necesidades.
            </p>
          </header>

          <div className="receipt-payment__cards">
            {paymentMethods.map(({ id, name, description, icon }) => (
              <article
                className={`receipt-payment__card receipt-payment__card--${id}`}
                key={id}
                aria-labelledby={`pagos-method-${id}-title`}
              >
                <div className="receipt-payment__icon-wrap">
                  <PaymentIcon name={name}>{icon}</PaymentIcon>
                </div>
                <h5 id={`pagos-method-${id}-title`} className="receipt-payment__card-title">
                  {name}
                </h5>
                <p>{description}</p>

                {id === 'sinpe' ? (
                  <div className="receipt-payment__details">
                    <p className="receipt-payment__sinpe-number">
                      <span>Número SINPE Móvil</span>
                      <strong>{telefono}</strong>
                    </p>
                    <p className="receipt-payment__warning" role="note">
                      Envía el comprobante de tu pago por SINPE Móvil al WhatsApp oficial de la
                      ASADA.
                    </p>
                    <a
                      className="receipt-payment__whatsapp-link"
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={whatsappLogo} alt="" aria-hidden="true" />
                      Enviar comprobante por WhatsApp
                    </a>
                  </div>
                ) : null}

                {id === 'banco-nacional' ? (
                  <a
                    className="receipt-payment__method-link"
                    href={BANCO_NACIONAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ir al Banco Nacional (abre una plataforma externa en una pestaña nueva)"
                  >
                    Ir al Banco Nacional <span aria-hidden="true">&#8599;</span>
                  </a>
                ) : null}

                {id === 'ventanilla' ? (
                  <dl className="receipt-payment__schedule">
                    <div>
                      <dt>Horario</dt>
                      <dd>{ventanillaHours}</dd>
                    </div>
                  </dl>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </RootTag>
  )
}

export default ReceiptPaymentSection
