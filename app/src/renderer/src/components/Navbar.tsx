import { LogIn, LogOut, Home, Users, Layers } from 'lucide-react'
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
      <div className="w-full px-4 flex items-center justify-between">
        {/* App Logo or Title */}
        <div className="text-foreground font-bold text-xl">Clickr</div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-24">
          <div className="flex space-x-24">
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
          </div>

          {!isAuthenticated ? (
            <div className="flex items-center space-x-24">
              <Button className="flex items-center gap-6" asChild>
                <Link to="/login">
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
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
