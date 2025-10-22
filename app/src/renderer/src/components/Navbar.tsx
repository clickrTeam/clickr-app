import { useState, useEffect } from 'react'
import { LogIn, LogOut, Home, Users, Layers, HelpCircle, Menu, X } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@renderer/lib/utils'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface NavbarProps {
  isAuthenticated: boolean
  username?: string
  logout?: () => void
}

const Navbar = ({ isAuthenticated, username, logout }: NavbarProps): JSX.Element | null => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  // const headerRef = useRef<HTMLElement | null>(null)

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

  // useEffect(() => {
  //   const setBodyPadding = (): void => {
  //     const h = headerRef.current?.offsetHeight ?? 0
  //     if (h > 0) {
  //       document.body.style.paddingTop = `${h}px`
  //     } else {
  //       document.body.style.paddingTop = ''
  //     }
  //   }

  //   // set immediately
  //   setBodyPadding()

  //   // update when window resizes (menu open/close, scrolled changes can alter height)
  //   window.addEventListener('resize', setBodyPadding)

  //   // also update when mobile menu toggles or scrolled changes
  //   // effect will re-run when these deps change
  //   return (): void => {
  //     window.removeEventListener('resize', setBodyPadding)
  //     document.body.style.paddingTop = ''
  //   }
  // }, [isMobileMenuOpen, scrolled])

  const navLinks = [
    { name: 'Mappings', path: '/', icon: Layers },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'DAEMON', path: '/daemon', icon: Home },
    { name: 'Help', path: '/help', icon: HelpCircle }
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
      // ref={headerRef}
    >
      {/* logo + hamburger */}
      <div className="flex items-center justify-between w-full px-4 md:hidden">
        <div className="text-foreground/80 font-bold text-xl">Clickr</div>
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

      {/* Desktop layout with evenly spaced items */}
      <div className="hidden md:flex w-full px-4 items-center">
        {/* Left: logo */}
        <div className="flex-shrink-0 text-foreground/80 font-bold text-xl">Clickr</div>

        {/* Center: nav links stretched evenly */}
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
