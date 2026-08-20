import type { ReciboConsultaData } from '../types/receipt.types'

export type NoPendingReceiptsProps = {
  data: ReciboConsultaData
}

export const NoPendingReceipts = ({ data }: NoPendingReceiptsProps) => {
  const { abonado, numeroPaja, mensaje } = data

  return (
    <article className="no-pending-receipts" aria-live="polite">
      <div className="no-pending-receipts__icon-wrap" aria-hidden="true">
        <svg
          className="no-pending-receipts__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <h3 className="no-pending-receipts__title">
        {mensaje || 'No posee recibos pendientes.'}
      </h3>

      <dl className="no-pending-receipts__details">
        <div className="no-pending-receipts__row">
          <dt>Abonado:</dt>
          <dd>{abonado || 'No especificado'}</dd>
        </div>

        <div className="no-pending-receipts__row">
          <dt>Número de paja:</dt>
          <dd>{numeroPaja}</dd>
        </div>
      </dl>
    </article>
  )
}

export default NoPendingReceipts
