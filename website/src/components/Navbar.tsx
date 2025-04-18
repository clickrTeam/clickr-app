import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Download, Menu, X, LogIn, UserPlus, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { get_user_mappings } from "@/api/endpoints";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleDownloadJSON = async () => {
    try {
      const username = "bode";
      const mappingsData = await get_user_mappings(username);

      // Create a Blob with the JSON data
      const blob = new Blob([JSON.stringify(mappingsData, null, 2)], {
        type: "application/json",
      });

      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}-mappings.json`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading mappings:", error);
      alert("Failed to download mappings");
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Community", path: "/community" },
    { name: "My Mappings", path: "/my-mappings" },
    { name: "Get JSON", onClick: handleDownloadJSON },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-clickr-light-blue/90 backdrop-blur-md py-2 shadow-md"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-foreground">Clickr</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <div className="flex space-x-6">
            {navLinks.map((link) =>
              link.onClick ? (
                <button
                  key={link.name}
                  onClick={link.onClick}
                  className={cn(
                    "font-medium transition-colors hover:text-clickr-blue text-foreground/80"
                  )}
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "font-medium transition-colors hover:text-clickr-blue",
                    isActive(link.path)
                      ? "text-clickr-blue"
                      : "text-foreground/80"
                  )}
                >
                  {link.name}
                </Link>
              )
            )}
          </div>
          {/* If user is authenticated, remove the register button and make download more prominate */}
          {!isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                asChild
              >
                <Link to="/download">
                  <Download size={18} />
                  <span>Download</span>
                </Link>
              </Button>

              <Button className="flex items-center gap-2" asChild>
                <Link to="/register">
                  <UserPlus size={18} />
                  <span>Register</span>
                </Link>
              </Button>

              <Button className="flex items-center gap-2" asChild>
                <Link to="/login">
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium ml-2">
                Welcome {user?.username}
              </span>
              <Button
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-700 to-clickr-blue text-white"
                asChild
              >
                <Link to="/download">
                  <Download size={18} />
                  <span>Download App</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-lg border-t"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "py-2 font-medium transition-colors hover:text-clickr-blue",
                    isActive(link.path)
                      ? "text-clickr-blue"
                      : "text-foreground/80"
                  )}
                >
                  {link.name}
                </Link>
              ))}

              <Link
                to="/download"
                className="flex items-center gap-2 py-2 font-medium transition-colors hover:text-clickr-blue"
              >
                <Download size={18} />
                <span>Download</span>
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-2 py-2 font-medium transition-colors hover:text-clickr-blue"
              >
                <UserPlus size={18} />
                <span>Register</span>
              </Link>
              <Button
                className="flex items-center justify-center gap-2 w-full"
                asChild
              >
                <Link to="/login">
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
