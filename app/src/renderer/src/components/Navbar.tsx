import { useState, useEffect } from 'react'
import { LogIn, LogOut, Users, Layers, HelpCircle, Menu, X, Settings, BarChart3 } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@renderer/lib/utils'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Daemon from '@renderer/pages/deamon'

interface NavbarProps {
  isAuthenticated: boolean
  username?: string
  logout?: () => void
}

const Navbar = ({ isAuthenticated, username, logout }: NavbarProps): JSX.Element | null => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = (): void => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return (): void => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrolled])

  const navLinks = [
    { name: 'Mappings', path: '/', icon: Layers },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Insights', path: '/insights', icon: BarChart3 },
    { name: 'Help', path: '/help', icon: HelpCircle },
    { name: 'Settings', path: '/settings', icon: Settings }
  ]
  if (location.pathname.startsWith('/training/game')) return null

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full',
        scrolled
          ? 'bg-clickr-light-blue/90 backdrop-blur-md py-2 shadow-md'
          : 'bg-clickr-light-blue py-3'
      )}
    >
      {/* logo + hamburger */}
      <div className="flex items-center justify-between w-full px-4 md:hidden">
        <Link to="/" className="text-foreground/80 font-bold text-xl hover:text-white transition-colors">
          Clickr
        </Link>
        <button
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((s) => !s)}
          className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(1_127_185)] text-foreground/90"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden px-4 bg-clickr-light-blue/95 backdrop-blur-lg border-t"
          >
            <nav className="flex flex-col space-y-3 py-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    cn(
                      'font-medium transition-colors hover:text-[rgb(1_127_185)] flex items-center gap-2',
                      isActive ? 'font-bold text-[#f9f9f9]' : 'text-foreground/80'
                    )
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon size={18} />
                  {link.name}
                </NavLink>
              ))}

              <Daemon refreshActive={false} />

              <div>
                {!isAuthenticated ? (
                  <Button className="flex items-center gap-2 w-full" asChild>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <LogIn size={18} />
                      <span>Login</span>
                    </Link>
                  </Button>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm font-medium">Welcome {username}</span>
                    <div className="flex items-center gap-2">
                      {logout && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsMobileMenuOpen(false)
                            logout()
                          }}
                          className="flex items-center gap-2"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden md:flex w-full px-4 items-center">
        <Link to="/" className="flex-shrink-0 text-foreground/80 font-bold text-xl hover:text-white transition-colors">
          Clickr
        </Link>

        <nav className="flex-1 flex justify-center">
          <div className="flex w-full max-w-4xl">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex-1 text-center px-2 py-1 font-medium transition-colors flex items-center justify-center gap-2',
                    isActive ? 'font-bold text-[#f9f9f9]' : 'text-foreground/80'
                  )
                }
              >
                <link.icon size={18} />
                <span className="truncate">{link.name}</span>
              </NavLink>
            ))}

            <Daemon refreshActive={true} />
          </div>
        </nav>

        {/* Right: auth */}
        <div className="flex-shrink-0">
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
