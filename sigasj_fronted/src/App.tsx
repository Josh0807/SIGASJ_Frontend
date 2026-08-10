import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage/components/LandingPage'
import { PUBLIC_SERVICE_REQUEST_ROUTES } from './LandingPage/config/serviceRequestRoutes'
import LoginPage from './auth/LoginPage'
import ProtectedRoute from './auth/ProtectedRoute'
import GalleryAdminPage from './admin/galeria/GalleryAdminPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/reportar-averia"
          element={<main aria-label="Formulario público de reporte de averías" />}
        />
        {PUBLIC_SERVICE_REQUEST_ROUTES.map(({ path, label }) => (
          <Route path={path} element={<main aria-label={label} />} key={path} />
        ))}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin/galeria"
          element={
            <ProtectedRoute>
              <GalleryAdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
