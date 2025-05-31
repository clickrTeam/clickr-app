import { useState, useEffect } from 'react'
import { LogIn, LogOut, Home, Users, Layers } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@renderer/lib/utils'
import { View } from '../App'

interface NavbarProps {
  currentView: View
  setCurrentView: (view: View) => void
  isAuthenticated: boolean
  username?: string
  logout?: () => void
}

const Navbar = ({
  currentView,
  setCurrentView,
  isAuthenticated,
  username,
  logout
}: NavbarProps) => {
  const navLinks = [
    { name: 'Home', view: View.HOME, icon: Home },
    { name: 'Community', view: View.COMMUNITY, icon: Users },
    { name: 'DAEMON', view: View.DAEMON, icon: Layers },
    { name: 'My Mappings', view: View.MY_MAPPINGS, icon: Layers }
  ]

  const handleViewChange = (view: View): void => {
    setCurrentView(view)
  }

  return (
    <header className="bg-cyan-400 py-2 shadow-md w-full">
      <div className="w-full px-4 flex items-center justify-between">
        {/* App Logo or Title */}
        <div className="text-foreground font-bold text-xl">Clickr</div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-24">
          <div className="flex space-x-24">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleViewChange(link.view)}
                className={cn(
                  'font-medium transition-colors hover:text-cyan-600 flex items-center gap-2',
                  currentView === link.view ? 'text-purple-400' : 'text-foreground/80'
                )}
              >
                <link.icon size={18} />
                {link.name}
              </button>
            ))}
          </div>

          {!isAuthenticated ? (
            <div className="flex items-center space-x-24">
              <Button
                className="flex items-center gap-6"
                onClick={() => handleViewChange(View.LOGIN)}
              >
                <LogIn size={18} />
                <span>Login</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium ml-2">Welcome {username}</span>
              {logout && (
                <Button variant="outline" onClick={logout} className="flex items-center gap-2">
                  <LogOut size={18} />
                  <span>Logout</span>
                </Button>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
