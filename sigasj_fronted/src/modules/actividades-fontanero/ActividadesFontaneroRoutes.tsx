import { Navigate, Route, Routes } from 'react-router-dom'
import { ACTIVIDADES_FONTANERO_PATHS } from './actividadesFontaneroPaths'
import ActividadesFontaneroCorreccionesPage from './pages/ActividadesFontaneroCorreccionesPage'
import ActividadesFontaneroHomePage from './pages/ActividadesFontaneroHomePage'
import ActividadesFontaneroRegistrarPage from './pages/ActividadesFontaneroRegistrarPage'
import ActividadesFontaneroStubPage from './pages/ActividadesFontaneroStubPage'

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
    <Route path="registrar" element={<ActividadesFontaneroRegistrarPage />} />
    <Route path="nueva" element={<ActividadesFontaneroRegistrarPage />} />
    <Route path="mis-actividades" element={<MisActividadesPage />} />
    <Route path="historial" element={<HistorialActividadesPage />} />
    <Route path="correcciones" element={<ActividadesFontaneroCorreccionesPage />} />
    <Route
      path="*"
      element={<Navigate to={ACTIVIDADES_FONTANERO_PATHS.home} replace />}
    />
  </Routes>
)

export default ActividadesFontaneroRoutes
