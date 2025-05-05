import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

type AuthRouteProps = {
  allowedRoles: Array<'customer' | 'rider' | 'admin'>;
};

const AuthRoute = ({ allowedRoles }: AuthRouteProps) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (profile && !allowedRoles.includes(profile.role as any)) {
    // Redirect based on user role
    if (profile.role === 'rider') {
      return <Navigate to="/rider-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  return <Outlet />;
};

export default AuthRoute;