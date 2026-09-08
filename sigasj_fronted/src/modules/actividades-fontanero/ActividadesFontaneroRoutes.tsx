import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { ACTIVIDADES_FONTANERO_PATHS } from './actividadesFontaneroPaths'
import ActividadesFontaneroCorreccionesPage from './pages/ActividadesFontaneroCorreccionesPage'
import ActividadesFontaneroHomePage from './pages/ActividadesFontaneroHomePage'
import ActividadesFontaneroStubPage from './pages/ActividadesFontaneroStubPage'
import CorregirActividadPage from './pages/CorregirActividadPage'
import RegistrarActividadPage from './pages/RegistrarActividadPage'
import SeleccionarTipoActividadPage from './pages/SeleccionarTipoActividadPage'

const RegistrarActividadAliasRedirect = () => {
  const { tipoCodigo } = useParams<{ tipoCodigo?: string }>()

  if (tipoCodigo) {
    return (
      <Navigate
        to={ACTIVIDADES_FONTANERO_PATHS.registrarTipo(tipoCodigo)}
        replace
      />
    )
  }

  return <Navigate to={ACTIVIDADES_FONTANERO_PATHS.nueva} replace />
}

const MisActividadesPage = () => (
  <ActividadesFontaneroStubPage
    title="Mis actividades"
    description="Consulte el listado de actividades que ha registrado."
  />
)

const HistorialActividadesPage = () => (
  <ActividadesFontaneroStubPage
    title="Historial de actividades"
    description="Consulte el historial de actividades registradas anteriormente."
  />
)

const ActividadesFontaneroRoutes = () => (
  <Routes>
    <Route index element={<ActividadesFontaneroHomePage />} />
    <Route path="registrar" element={<RegistrarActividadAliasRedirect />} />
    <Route path="registrar/:tipoCodigo" element={<RegistrarActividadAliasRedirect />} />
    <Route path="nueva" element={<SeleccionarTipoActividadPage />} />
    <Route path="nueva/:tipoCodigo" element={<RegistrarActividadPage />} />
    <Route path="mis-actividades" element={<MisActividadesPage />} />
    <Route path="historial" element={<HistorialActividadesPage />} />
    <Route path="correcciones" element={<ActividadesFontaneroCorreccionesPage />} />
    <Route path="correcciones/:actividadId/corregir" element={<CorregirActividadPage />} />
    <Route
      path="*"
      element={<Navigate to={ACTIVIDADES_FONTANERO_PATHS.home} replace />}
    />
  </Routes>
)

export default ActividadesFontaneroRoutes
