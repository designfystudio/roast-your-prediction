import { Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Nav from './components/Nav'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import RoastPage from './pages/RoastPage'
import ExcusePage from './pages/ExcusePage'

// Router shell for The Banter Toolbox. Pages own their content; the shell owns
// the shared Nav + Footer and the full-height column so the footer stays low.
export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/roast" element={<RoastPage />} />
          <Route path="/excuse" element={<ExcusePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
      <Analytics />
    </div>
  )
}
