import type { ReactNode } from 'react'
import { BANCO_NACIONAL_URL, SADA_WEB_RECEIPT_URL } from '../config/externalLinks'

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

const ReceiptPaymentSection = () => (
  <section
    className="landing-section receipt-payment"
    id="pagos"
    aria-labelledby="receipt-payment-title"
  >
    <div className="receipt-payment__content">
      <article className="receipt-payment__consultation">
        <div>
          <p className="receipt-payment__eyebrow">Consulta en línea</p>
          <h2 id="receipt-payment-title">Consulta tu recibo</h2>
          <p>Revisa de forma rápida la información de tu recibo de agua.</p>
        </div>
        <div className="receipt-payment__action">
          {SADA_WEB_RECEIPT_URL ? (
            <a
              className="receipt-payment__button"
              href={SADA_WEB_RECEIPT_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-describedby="receipt-payment-external-note"
            >
              Consultar mi recibo <span aria-hidden="true">&#8599;</span>
            </a>
          ) : (
            <span
              className="receipt-payment__button receipt-payment__button--disabled"
              aria-disabled="true"
            >
              Consulta no disponible
            </span>
          )}
          <p id="receipt-payment-external-note" className="receipt-payment__external-note">
            Toca el botón para consultar tu recibo en SADA Web.
          </p>
        </div>
      </article>

      <div className="receipt-payment__methods" aria-labelledby="payment-methods-title">
        <div className="receipt-payment__heading">
          <p className="receipt-payment__eyebrow">Opciones disponibles</p>
          <h2 id="payment-methods-title">Métodos de pago</h2>
          <p>Elige la alternativa que mejor se adapte a tus necesidades.</p>
        </div>

        <div className="receipt-payment__cards">
          {paymentMethods.map(({ id, name, description, icon }) => (
            <article className={`receipt-payment__card receipt-payment__card--${id}`} key={name}>
              <div className="receipt-payment__icon-wrap">
                <PaymentIcon name={name}>{icon}</PaymentIcon>
              </div>
              <h3>{name}</h3>
              <p>{description}</p>

              {id === 'sinpe' ? (
                <div className="receipt-payment__details">
                  <p className="receipt-payment__sinpe-number">
                    <span>Número demostrativo</span>
                    <strong>0000-0000</strong>
                  </p>
                  <p className="receipt-payment__warning" role="note">
                    Este número es ficticio y debe reemplazarse por el número oficial antes de
                    publicar el sistema.
                  </p>
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
                    <dd>Lunes a sábado</dd>
                  </div>
                  <div>
                    <dt>Atención</dt>
                    <dd>7:30 a. m. a 11:30 a. m.</dd>
                  </div>
                </dl>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
)

export default ReceiptPaymentSection
