import { Navigate, Outlet } from 'react-router-dom'

interface ProtectedRouteProps {
  isAuthenticated: boolean
}

const ProtectedRoute = ({ isAuthenticated }: ProtectedRouteProps): JSX.Element => {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoute
