import type { ReactNode } from 'react'

type PaymentMethod = {
  name: string
  description: string
  icon: ReactNode
}

const paymentMethods: PaymentMethod[] = [
  {
    name: 'SINPE Móvil',
    description: 'Realiza el pago de tu recibo mediante SINPE Móvil.',
    icon: (
      <path d="M8 3.5h8a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Zm1 3h6m-4 11h2M8.5 10h7m-3.5-2.5V13" />
    ),
  },
  {
    name: 'Banco Nacional',
    description: 'Paga por medio de los canales disponibles del Banco Nacional.',
    icon: (
      <>
        <path d="m3 9 9-5 9 5M5 10h14M6.5 10v7m3.5-7v7m4-7v7m3.5-7v7M4 20h16" />
      </>
    ),
  },
  {
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
        <button className="receipt-payment__button" type="button">
          Consultar mi recibo
        </button>
      </article>

      <div className="receipt-payment__methods" aria-labelledby="payment-methods-title">
        <div className="receipt-payment__heading">
          <p className="receipt-payment__eyebrow">Opciones disponibles</p>
          <h2 id="payment-methods-title">Métodos de pago</h2>
        </div>

        <div className="receipt-payment__cards">
          {paymentMethods.map(({ name, description, icon }) => (
            <article className="receipt-payment__card" key={name}>
              <div className="receipt-payment__icon-wrap">
                <PaymentIcon name={name}>{icon}</PaymentIcon>
              </div>
              <h3>{name}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
)

export default ReceiptPaymentSection

