import { Navigate, useParams } from 'react-router-dom'
import ActividadRegistroFormShell from '../components/ActividadRegistroFormShell'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { findTipoActividadByCodigo } from '../types/tipoActividadFontanero'

const RegistrarActividadPage = () => {
  const { tipoCodigo } = useParams<{ tipoCodigo: string }>()
  const tipo = findTipoActividadByCodigo(tipoCodigo)

  if (!tipo) {
    return <Navigate to={ACTIVIDADES_FONTANERO_PATHS.nueva} replace />
  }

  return <ActividadRegistroFormShell tipo={tipo} />
}

export default RegistrarActividadPage
