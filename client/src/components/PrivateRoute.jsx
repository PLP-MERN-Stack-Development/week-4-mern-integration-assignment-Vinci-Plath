import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute component that redirects to /login if user is not authenticated.
 * Can be used as a wrapper component or with the 'element' prop in React Router v6.
 */
const PrivateRoute = ({ element: Element, ...rest }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login with the return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: rest.location }} replace />;
  }

  // If using the component as a wrapper
  if (Element) {
    return <Element {...rest} />;
  }

  // For use with React Router v6 'element' prop
  return <Outlet />;
};

export default PrivateRoute;
