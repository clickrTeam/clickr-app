import { LogIn, LogOut, Home, Users, Layers, Settings } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@renderer/lib/utils'
import { Link, useLocation } from 'react-router-dom'

interface NavbarProps {
  isAuthenticated: boolean
  username?: string
  logout?: () => void
}

const Navbar = ({ isAuthenticated, username, logout }: NavbarProps) => {
  const location = useLocation()

  const navLinks = [

    { name: 'Mappings', path: '/', icon: Layers },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'DAEMON', path: '/daemon', icon: Home }
  ]

  return (
    <header className="bg-cyan-400 py-2 shadow-md w-full">
      <div className="w-full px-4 hidden md:flex items-center justify-between">
        {/* App Logo */}
        <div className="text-foreground font-bold text-xl">Clickr</div>

        {/* Navigation Links */}
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={cn(
              'font-medium transition-colors hover:text-cyan-600 flex items-center gap-2',
              location.pathname === link.path ? 'text-white' : 'text-foreground/80'
            )}
          >
            <link.icon size={18} />
            {link.name}
          </Link>
        ))}

        {/* Auth section */}
        <div className="flex items-center space-x-3">
          {!isAuthenticated ? (
            <Button className="flex items-center gap-2" asChild>
              <Link to="/login">
                <LogIn size={18} />
                <span>Login</span>
              </Link>
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium">Welcome {username}</span>
              {logout && (
                <Button variant="outline" onClick={logout} className="flex items-center gap-2">
                  <LogOut size={18} />
                  <span>Logout</span>
                </Button>
              )}
            </div>
          )}
          <Button variant="outline" size="icon" className="p-2" asChild>
            <Link to="/settings">
              <Settings size={20} />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
