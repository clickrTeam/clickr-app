import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import { Toaster } from '@renderer/components/ui/sonner'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Community from './pages/community'
import MyMappings from './pages/MyMappings'
import MappingDetail from './pages/mappingDetails'
import Training from './pages/Training'
import Game from './pages/Game'
import Help from './pages/help'
import Settings from './pages/Settings'
import Insights from './pages/Insights'

function App(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [username, setUsername] = useState<string>('')
  const navigate = useNavigate()

  // Check authentication status in background - don't block UI
  useEffect(() => {
    const checkAuthStatus = async (): Promise<void> => {
      try {
        const authStatus = await window.api.checkAuth()
        if (authStatus.isAuthenticated && authStatus.username) {
          setIsAuthenticated(true)
          setUsername(authStatus.username)
        }
      } catch (error) {
        console.error('Failed to check auth status:', error)
        // Don't block UI on auth failure
        setIsAuthenticated(false)
        setUsername('')
      }
    }

    // Small delay to let UI render first, then check auth
    setTimeout(checkAuthStatus, 100)
  }, [])

  const logout = async (): Promise<void> => {
    try {
      await window.api.logout()
      setIsAuthenticated(false)
      setUsername('')
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
      // Still clear local state even if logout fails
      setIsAuthenticated(false)
      setUsername('')
      navigate('/')
    }
  }

  const login = (userData: { username: string }): void => {
    setIsAuthenticated(true)
    setUsername(userData.username)
    navigate('/')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full h-full">
      <Navbar isAuthenticated={isAuthenticated} username={username} logout={logout} />

      {/* Add padding-top to account for fixed navbar */}
      <div className="w-full px-4 flex-grow py-8 pt-20">
        <Routes>
          <Route
            path="/"
            element={<MyMappings isAuthenticated={isAuthenticated} username={username} />}
          />
          <Route path="/login" element={<Login login={login} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/community" element={<Community />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/mapping/:mappingId" element={<MappingDetail />} />
          <Route
            path="/mappings"
            element={<MyMappings isAuthenticated={isAuthenticated} username={username} />}
          />
          <Route path="/training" element={<Training />} />
          <Route path="/training/game" element={<Game />} />
          <Route path="/help/*" element={<Help />} />
          <Route
            path="/settings"
            element={<Settings isAuthenticated={isAuthenticated} username={username} />}
          />
        </Routes>
      </div>

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  )
}

export default App
