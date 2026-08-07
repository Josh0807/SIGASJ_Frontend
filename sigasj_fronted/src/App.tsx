import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage/components/LandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Destino de navegación; la pantalla de login se implementará en otra tarea. */}
        <Route path="/login" element={<main aria-label="Iniciar sesión" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
