import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Roster from './pages/Roster'
import Friends from './pages/Friends'
import Challenges from './pages/Challenges'
import Lobby from './pages/Lobby'
import Match from './pages/Match'
import End from './pages/End'
import Profile from './pages/Profile'
import Cards from './pages/Cards'
import Leaderboard from './pages/Leaderboard'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/home" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SocketProvider>
        <Routes>
          <Route path="/login"      element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/"           element={<Navigate to="/home" replace />} />
          <Route path="/home"       element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/roster"     element={<PrivateRoute><Roster /></PrivateRoute>} />
          <Route path="/friends"    element={<PrivateRoute><Friends /></PrivateRoute>} />
          <Route path="/challenges" element={<PrivateRoute><Challenges /></PrivateRoute>} />
          <Route path="/lobby"      element={<PrivateRoute><Lobby /></PrivateRoute>} />
          <Route path="/match"      element={<PrivateRoute><Match /></PrivateRoute>} />
          <Route path="/end"        element={<PrivateRoute><End /></PrivateRoute>} />
          <Route path="/profile"     element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/cards"       element={<PrivateRoute><Cards /></PrivateRoute>} />
          <Route path="*"           element={<Navigate to="/home" replace />} />
        </Routes>
        </SocketProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}
