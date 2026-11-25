import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import RagasPage from './pages/RagasPage'
import ComingSoonPage from './pages/ComingSoonPage'

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
          <Route path="/taals" element={<ComingSoonPage titleKey="navTaals" />} />
          <Route path="/compositions" element={<ComingSoonPage titleKey="navCompositions" />} />
          <Route path="/classroom" element={<ComingSoonPage titleKey="navClassroom" />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
    </>
  )
}
