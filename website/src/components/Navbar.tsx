import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Download, Menu, X, LogIn, UserPlus, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { get_user_mappings } from "@/api/endpoints";
import { useAuth } from "@/contexts/AuthContext";
// Define the type for the detected operating system
type OperatingSystem = "windows" | "macos" | "linux" | "unknown";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [detectedOS, setDetectedOS] = useState<OperatingSystem>("unknown");
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();

    if (userAgent.includes("win")) {
      setDetectedOS("windows");
    } else if (userAgent.includes("mac")) {
      setDetectedOS("macos");
    } else if (userAgent.includes("linux")) {
      setDetectedOS("linux");
    } else {
      setDetectedOS("unknown");
    }
  }, []);

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

  
  const WIN_DOWNLOAD: string = "clickr-windows.exe";
  const MAC_DOWNLOAD: string = "clickr-macos.dmg";
  const LINUX_DOWNLOAD: string = "clickr.run";

  const getDownloadLink = () => {
    const baseUrl = "https://pub-88623f5677af473299bdb0e0cb10017e.r2.dev";
    switch (detectedOS) {
      case "windows":
        return `${baseUrl}/${WIN_DOWNLOAD}`;
      case "macos":
        return `${baseUrl}/${MAC_DOWNLOAD}`;
      case "linux":
        return `${baseUrl}/${LINUX_DOWNLOAD}`;
      default:
        return `${baseUrl}/${MAC_DOWNLOAD}`;
    }
  };

  const getDownloadFilename = () => {
    switch (detectedOS) {
      case "windows":
        return WIN_DOWNLOAD;
      case "macos":
        return MAC_DOWNLOAD;
      case "linux":
        return LINUX_DOWNLOAD;
      default:
        return "clickr-app";
    }
  };

  const getDownloadButtonText = () => {
    switch (detectedOS) {
      case "windows":
        return "Download for Windows";
      case "macos":
        return "Download for macOS";
      case "linux":
        return "Download for Linux";
      default:
        return "Download App";
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    const link = getDownloadLink();
    const filename = getDownloadFilename();

    try {
      // Fetch the file as a blob
      const response = await fetch(link);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to direct link navigation
      window.location.href = link;
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Community", path: "/community" },
    { name: "My Mappings", path: "/my-mappings" },
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
            {
              navLinks.map((link) => (
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
              ))
              // )
            }
          </div>
          {/* If user is authenticated, remove the register button and make download more prominate */}
          {!isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleDownload}
              >
                <Download size={18} />
                <span>{getDownloadButtonText()}</span>
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
                onClick={handleDownload}
              >
                <Download size={18} />
                <span>{getDownloadButtonText()}</span>
              </Button>

              <Button
                variant="outline"
                onClick={logout}
                className="flex items-center justify-center gap-2"
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

              {!isAuthenticated ? (
                <>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 py-2 font-medium transition-colors hover:text-clickr-blue text-left w-full"
                  >
                    <Download size={18} />
                    <span>{getDownloadButtonText()}</span>
                  </button>
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
                </>
              ) : (
                <>
                  <span className="py-2 text-sm font-medium text-foreground/80 ">
                    Welcome {user?.username}
                  </span>
                  <Button
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-700 to-clickr-blue text-white"
                    onClick={handleDownload}
                  >
                    <Download size={18} />
                    <span>{getDownloadButtonText()}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="flex items-center justify-center gap-2 w-full"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
