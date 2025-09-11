import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import { Toaster } from '@renderer/components/ui/sonner'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Community from './pages/community'
import Daemon from './pages/deamon'
import MyMappings from './pages/MyMappings'
import MappingDetail from './pages/mappingDetails'

// Components
import ProtectedRoute from './components/ProtectedRoute'

function App(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [username, setUsername] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const navigate = useNavigate()

  // Check authentication status on app load
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
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
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
    navigate('/my-mappings')
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white w-full h-full">
      <Navbar isAuthenticated={isAuthenticated} username={username} logout={logout} />

      <div className="w-full px-4 flex-grow py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login login={login} />} />
          <Route path="/community" element={<Community />} />
          <Route path="/mapping/:mappingId" element={<MappingDetail />} />
          <Route path="/daemon" element={<Daemon />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/my-mappings" element={<MyMappings />} />
          </Route>
        </Routes>
      </div>

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  )
}

export default App
