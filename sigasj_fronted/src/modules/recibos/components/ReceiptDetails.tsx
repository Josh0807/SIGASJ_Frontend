import type { ReciboConsultaData, ReciboItem } from '../types/receipt.types'

export const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₡0'
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-'
  try {
    const parts = dateStr.split('T')[0].split('-')
    if (parts.length === 3) {
      const [year, month, day] = parts
      return `${day}/${month}/${year}`
    }
    return dateStr
  } catch {
    return dateStr
  }
}

export type ReceiptDetailsProps = {
  data: ReciboConsultaData
}

export const ReceiptDetails = ({ data }: ReceiptDetailsProps) => {
  const { abonado, numeroPaja, recibos } = data

  return (
    <div className="receipt-details">
      <div className="receipt-details__header">
        <h3 className="receipt-details__title">Detalle del recibo</h3>
        <dl className="receipt-details__meta">
          <div className="receipt-details__meta-item">
            <dt>Abonado</dt>
            <dd>
              <strong>{abonado || 'No especificado'}</strong>
            </dd>
          </div>
          <div className="receipt-details__meta-item">
            <dt>Número de paja</dt>
            <dd>
              <strong>{numeroPaja}</strong>
            </dd>
          </div>
        </dl>
      </div>

      <div className="receipt-details__cards" role="list">
        {recibos.map((recibo: ReciboItem, index: number) => {
          const key = `recibo-${index}-${recibo.fechaEmision || ''}`
          return (
            <article className="receipt-card" key={key} role="listitem">
              {recibos.length > 1 ? (
                <div className="receipt-card__badge">Recibo #{index + 1}</div>
              ) : null}

              <dl className="receipt-card__info">
                {recibo.periodo ? (
                  <div className="receipt-card__row">
                    <dt>Período</dt>
                    <dd>{recibo.periodo}</dd>
                  </div>
                ) : null}

                <div className="receipt-card__row">
                  <dt>Fecha de emisión</dt>
                  <dd>{formatDate(recibo.fechaEmision)}</dd>
                </div>

                <div className="receipt-card__row receipt-card__row--highlight-date">
                  <dt>Fecha de vencimiento</dt>
                  <dd>
                    <time dateTime={recibo.fechaVencimiento}>
                      {formatDate(recibo.fechaVencimiento)}
                    </time>
                  </dd>
                </div>

                <div className="receipt-card__row receipt-card__row--total">
                  <dt>TOTAL A PAGAR</dt>
                  <dd className="receipt-card__total-amount">
                    {formatCurrency(recibo.total)}
                  </dd>
                </div>
              </dl>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default ReceiptDetails
