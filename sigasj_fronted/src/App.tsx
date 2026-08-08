import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage/components/LandingPage'
import { PUBLIC_SERVICE_REQUEST_ROUTES } from './LandingPage/config/serviceRequestRoutes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Ruta pública para integrar el formulario de reporte de averías. */}
        <Route
          path="/reportar-averia"
          element={<main aria-label="Formulario público de reporte de averías" />}
        />
        {PUBLIC_SERVICE_REQUEST_ROUTES.map(({ path, label }) => (
          <Route path={path} element={<main aria-label={label} />} key={path} />
        ))}
        {/* Destino de navegación; la pantalla de login se implementará en otra tarea. */}
        <Route path="/login" element={<main aria-label="Iniciar sesión" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
