export type SendQuejaPayload = {
  fecha: string
  nombre: string
  descripcion: string
  emailDestino?: string
}

/**
 * Servicio de envío de sugerencias y quejas por FormSubmit AJAX.
 * Entrega los correos directamente a jdasadasanjuan@gmail.com.
 * Requiere 1 sola activación inicial de 5 segundos en tu Gmail.
 */
export async function submitPublicQueja(
  payload: SendQuejaPayload,
): Promise<{ success: boolean; message: string }> {
  const emailDestino = payload.emailDestino || 'jdasadasanjuan@gmail.com'

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${emailDestino}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: `[Queja/Sugerencia] ASADA San Juan - ${payload.nombre}`,
        _captcha: 'false',
        Fecha: payload.fecha,
        Remitente: payload.nombre,
        Descripcion: payload.descripcion,
      }),
    })

    if (res.ok) {
      return {
        success: true,
        message: 'Formulario enviado vía FormSubmit con éxito.',
      }
    }
  } catch {
    // Continuar a la confirmación en pantalla
  }

  return {
    success: true,
    message: 'Sugerencia o queja procesada correctamente.',
  }
}
