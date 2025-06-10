import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { get_auth, refresh_token, logout as apiLogout } from "@/api/endpoints";

// Define the User type
type User = {
  username: string;
  email: string;
};

// Define the AuthContext type
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in when the app loads
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        
        if (!accessToken || !storedUser) {
          setLoading(false);
          return;
        }

        // Try to validate the current session
        try {
          await get_auth();
          // If successful, set user from localStorage
          setUser(JSON.parse(storedUser));
        } catch (error) {
          // Token might be expired, try to refresh
          try {
            await refresh_token();
            // If refresh successful, set user
            setUser(JSON.parse(storedUser));
          } catch (refreshError) {
            // Both access and refresh failed, clear everything
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        // Any error means user is not authenticated
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login function - store user in context and localStorage
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Logout function - clear user from context and localStorage
  const logout = () => {
    setUser(null);
    apiLogout(); // This clears tokens from localStorage
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      await refresh_token();
      // Could fetch fresh user data here if needed
    } catch (error) {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
