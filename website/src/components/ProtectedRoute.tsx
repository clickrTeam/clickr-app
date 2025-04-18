import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "./ui/spinner";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state
  if (loading) {
    return <PageLoader />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
