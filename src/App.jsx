import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import { RequireAuth } from './components/ui'
import HomePage from './pages/HomePage'
import RagasPage from './pages/RagasPage'
import TaalsPage from './pages/TaalsPage'
import TaalDetailPage from './pages/TaalDetailPage'
import CompositionsPage from './pages/CompositionsPage'
import LoginPage from './pages/LoginPage'
import AccountPage from './pages/AccountPage'
import ClassroomPage from './pages/classroom/ClassroomPage'
import ClassPage from './pages/classroom/ClassPage'
import AssignmentPage from './pages/classroom/AssignmentPage'

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
          <Route path="/compositions" element={<CompositionsPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Pages below need a signed-in user; RequireAuth redirects to /login otherwise */}
          <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
          <Route path="/classroom" element={<RequireAuth><ClassroomPage /></RequireAuth>} />
          <Route path="/classroom/:classId" element={<RequireAuth><ClassPage /></RequireAuth>} />
          <Route
            path="/classroom/:classId/assignments/:assignmentId"
            element={<RequireAuth><AssignmentPage /></RequireAuth>}
          />

          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
    </>
  )
}
