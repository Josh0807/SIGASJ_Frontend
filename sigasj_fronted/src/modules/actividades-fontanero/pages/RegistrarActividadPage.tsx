import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import ActividadRegistroFormShell from '../components/ActividadRegistroFormShell'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { useTiposActividadFontanero } from '../hooks/useTiposActividadFontanero'
import { useAuth } from '../../auth/components/AuthContext'

const RegistrarActividadPage = () => {
  const { tipoCodigo } = useParams<{ tipoCodigo: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const catalogo = useTiposActividadFontanero()
  const tipo = catalogo.tipos.find((item) => item.codigo === tipoCodigo)

  useEffect(() => {
    if (catalogo.isUnauthorized) {
      logout()
      navigate('/login', { replace: true })
    }
  }, [catalogo.isUnauthorized, logout, navigate])

  if (catalogo.isLoading) return <p role="status">Cargando tipo de actividad…</p>
  if (catalogo.isUnauthorized) return <p role="alert">Su sesión no es válida o ha vencido.</p>
  if (catalogo.isForbidden) return <p role="alert">No tiene permiso para registrar actividades.</p>
  if (catalogo.isError) return <p role="alert">No se pudo cargar el catálogo. <button type="button" onClick={catalogo.refetch}>Reintentar</button></p>

  if (!tipo) {
    return <Navigate to={ACTIVIDADES_FONTANERO_PATHS.nueva} replace />
  }

  return <ActividadRegistroFormShell tipo={tipo} onCatalogStale={catalogo.refetch} />
}

export default RegistrarActividadPage
