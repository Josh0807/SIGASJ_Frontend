const value = process.env.VITE_API_URL?.trim() ?? ''

if (!value.startsWith('https://')) {
  console.error(
    'VITE_API_URL debe ser la URL HTTPS de la API en Render antes de publicar en Vercel.',
  )
  console.error('Ejemplo: https://<servicio>.onrender.com/api/v1')
  process.exit(1)
}

try {
  const url = new URL(value)
  if (url.protocol !== 'https:') {
    throw new Error('protocolo')
  }
} catch {
  console.error('VITE_API_URL no es una URL HTTPS válida.')
  process.exit(1)
}
