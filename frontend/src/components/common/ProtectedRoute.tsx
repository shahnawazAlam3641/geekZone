import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAppSelector } from "../../store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute = ({
  children,
  requireAuth = true,
}: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { loading } = useAppSelector((state) => state.auth);

  if (loading) {
    // Show loading state or a skeleton while auth is being checked
    return (
      <div className="flex justify-center items-center h-screen">
        Verifying authentication...
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route while not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // Redirect to feed if trying to access auth pages while authenticated
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
