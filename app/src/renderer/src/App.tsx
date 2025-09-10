import { useState } from 'react'
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
  const navigate = useNavigate()

  const logout = (): void => {
    setIsAuthenticated(false)
    setUsername('')
    navigate('/')
  }

  // Mock login function
  const login = (): void => {
    setIsAuthenticated(true)
    setUsername('TestUser')
    navigate('/my-mappings')
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
