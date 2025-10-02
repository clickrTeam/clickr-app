import { LogIn, LogOut, Home, Users, Layers, HelpCircle } from 'lucide-react'
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
    { name: 'DAEMON', path: '/daemon', icon: Home },
    { name: 'Help', path: '/help', icon: HelpCircle }
  ]

  return (
    <header className="bg-cyan-400 py-2 shadow-md w-full">
      <div className="w-full px-4 hidden md:flex items-center justify-between">
        {/* App Logo */}
        <div className="text-foreground font-bold text-xl">Clickr</div>

        {/* Navigation Links */}
        {navLinks.map((link) => {
          const isActive = link.name === 'Help' 
            ? location.pathname.startsWith('/help')
            : location.pathname === link.path
          
          return (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                'font-medium transition-colors hover:text-cyan-600 flex items-center gap-2',
                isActive ? 'text-white' : 'text-foreground/80'
              )}
            >
              <link.icon size={18} />
              {link.name}
            </Link>
          )
        })}

        {/* Auth section */}
        <div>
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
        </div>
      </div>
    </header>
  )
}

export default Navbar
