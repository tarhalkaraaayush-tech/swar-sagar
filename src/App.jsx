import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import RagasPage from './pages/RagasPage'
import ComingSoonPage from './pages/ComingSoonPage'
import TaalsPage from './pages/TaalsPage'
import TaalDetailPage from './pages/TaalDetailPage'

// The Navbar stays on screen; only the part inside <Routes> swaps
// when the URL changes — no full page reload.
export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ragas" element={<RagasPage />} />
          <Route path="/taals" element={<TaalsPage />} />
          {/* ":id" is a URL parameter — /taals/teentaal gives id = "teentaal" */}
          <Route path="/taals/:id" element={<TaalDetailPage />} />
          <Route path="/compositions" element={<ComingSoonPage titleKey="navCompositions" />} />
          <Route path="/classroom" element={<ComingSoonPage titleKey="navClassroom" />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
    </>
  )
}
